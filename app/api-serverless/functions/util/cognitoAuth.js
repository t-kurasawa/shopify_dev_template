'use strict';
/**
 * https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
 * https://github.com/serverless/examples/blob/master/aws-node-auth0-cognito-custom-authorizers-api/auth.js
 * https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts
 */
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const request = require('request');
const moment = require('moment')

// For Auth0:       https://<project>.auth0.com/
// refer to:        http://bit.ly/2hoeRXk
// For AWS Cognito: https://cognito-idp.<region>.amazonaws.com/<user pool id>
// refer to:        http://amzn.to/2fo77UI
const iss = `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

// Generate policy to allow this user on this API:
const generatePolicy = (principalId, effect, resource) => {
  try {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
      const policyDocument = {};
      policyDocument.Version = '2012-10-17';
      policyDocument.Statement = [];
      const statementOne = {};
      statementOne.Action = 'execute-api:Invoke';
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
    }
    return authResponse;
  } catch(error) {
    console.log(error)
  }
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.authorize = (event, context, cb) => {
  try {
    console.log('Auth function invoked');
    // TODO: エラー時の API Gateway へのヘッダー付与（CORS対策）
    if (event.authorizationToken) {
      // Remove 'bearer ' from token:
      const token = event.authorizationToken.substring(7);
      /**
       * ステップ 1: JWT の構造を確認する
       */
      console.log(`token: ${token}`)
      const tokenSections = (token || '').split('.');
      if (tokenSections.length < 2) {
        console.log('requested token is invalid');
        cb('Unauthorized');
      }
      
      /**
       * ステップ 2: JWT 署名を検証する
       * 2-1. ID トークンをデコードします。
       */
      const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
      const header = JSON.parse(headerJSON)
      // console.log(`header: ${headerJSON}`)
      const payloadJSON = Buffer.from(tokenSections[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadJSON)
      // console.log(`payload: ${payloadJSON}`)

      /**
       * 2-2. ローカルのキー ID (kid) とパブリックの kid を比較します。
       */
      // Make a request to the iss + .well-known/jwks.json URL:
      request(
        { url: `${iss}/.well-known/jwks.json`, json: true },
        (error, response, body) => {
          if (error || response.statusCode !== 200) {
            //エンドポイントが見つからなかった場合の処理
            console.log('Request error:', error);
            cb('Unauthorized');
          }
          console.log(body)
          // Based on the JSON of `jwks` create a Pem:
          let keyIndex = -1
          // ローカルのキー ID (kid) とパブリックの kid の比較のため jwks から一致する jwk を探す
          for(let i in body.keys){
            // console.log(`value is :${body.keys[i]}`)
            // console.log(`index is :${i}`)
            if(header.kid == body.keys[i]['kid']){
              keyIndex = i;
              break;
            }
          }
          // エンドポイントから公開鍵が見つからなかった場合の処理
          if(keyIndex == -1){
            console.log('Public key not found in jwks.json');
            cb('Unauthorized');
          }

          // 一致した jwk を利用する
          const k = body.keys[keyIndex];
          const jwkArray = {
            kty: k.kty,
            n: k.n,
            e: k.e,
          };

          /**
           * 2-3. JWT ライブラリを使用して署名を検証するには、このパブリックキーを使用します。
           * まず、JWK を PEM 形式に変換する必要がある場合があります。
           * この例では、JWT および JWK を取得し、Node.js ライブラリ、jsonwebtoken を使用して JWT 署名を検証します。
           */
          const pem = jwkToPem(jwkArray);
          // Verify the token:
          jwt.verify(token, pem, { issuer: iss }, (err, decoded) => {
            if (err) {
              // JWTの署名チェックが失敗した場合の処理
              console.log('Unauthorized user:', err.message);
              cb('Unauthorized');
            } else {
              /**
               * ステップ 3: クレームを検証する
               */
              // JWTの有効期限が切れていた場合の処理
              if(moment().unix() > payload.exp){
                console.log('Token is expired');
                cb('Unauthorized');
              }
              // audクレームが想定された値でない場合の処理
              // CognitoのJWTのaudクレームには、認証されたユーザーで使用されるclient_idが含まれる
              // TODO: 「含まれる」の検証は !== で良いのか確認
              if(payload.aud !== process.env.COGNITO_CLIENTID){
                console.log('Token was not issued for this audience');
                cb('Unauthorized');
              }

              // 全ての検証を通過して認可する
              cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
            }
          });
        },
      );
    } else {
      console.log('No authorizationToken found in the header.');
      cb('Unauthorized');
    }
  } catch(err) {
    console.log('Something wrong.');
    console.log(err)
    cb('Unauthorized');
  }
};
