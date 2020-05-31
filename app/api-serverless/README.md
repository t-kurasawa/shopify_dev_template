# Serverless API
- Amplify の api / function は拡張性が弱いため利用せず、Serverless Framework でバックエンド API を構築

## 環境構築
- [Serverless Framework](https://www.serverless.com/framework/docs/)をインストール

## API のビルド＆デプロイ
- yarn install
- serverless deploy

## Cognito 認証
- 以下をベースに実装
　- https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
　- https://github.com/serverless/examples/blob/master/aws-node-auth0-cognito-custom-authorizers-api/auth.js
　- https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts

### authorizer を使う全ての HTTP エンドポイントにおいて TTL のキャッシュを無効(0)にする
- resultTtlInSeconds: 0
　- オーソライザーのキャッシュが有効だと、複数の HTTP イベントからオーソライザーが呼び出された際に HTTP イベントが異なっても以前の HTTP イベントのキャッシュが参照されてしまう。
　- GET -> POST とリクエストすると GET だと認識してしまうのでオーソライザーのキャッシュを無効にして対応する。
　- [公式の解説](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/#http-endpoints-with-custom-authorizers)

## .env
- SHOPIFY_API_KEY
　- Shopify パートナーダッシュボードから取得
- SHOPIFY_API_SECRET
　- Shopify パートナーダッシュボードから取得
- COGNITO_USER_POOL
　- Cognito コンソールから ID を取得
- REGION
　- リージョンを指定
- PUBLIC_API_URL=/api/public
- PRIVATE_API_URL=/api/private
