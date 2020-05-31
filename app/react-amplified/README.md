# Create React App を Amplify CLI でホスティングする
- [公式 Tutorial](https://docs.amplify.aws/start/q/integration/react)を参照

## 環境構築
- [AWS Amplify CLI](https://www.npmjs.com/package/@aws-amplify/cli)をインストール
- [Create React App](https://reactjs.org/docs/create-a-new-react-app.html)をインストール

## アプリのビルド＆デプロイ
- npx create-react-app react-amplified
- amplify init
- amplify hosting add
- amplify publish


```
$ amplify init
Note: It is recommended to run this command from the root of your app directory
? Enter a name for the project react-amplified
? Enter a name for the environment dev
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building javascript
Please tell us about your project
? What javascript framework are you using react
? Source Directory Path:  src
? Distribution Directory Path: build
? Build Command:  npm run-script build
? Start Command: npm run-script start
Using default provider  awscloudformation

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-multiple-profiles.html

? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use default
```

## 注意点
### Shopify アプリは HTTPS 必須
- amplify hosting add で prod を選択
- すでに作成済の場合は amplify hosting update で Cloudfront を設定する

### Cloudfront の cache が残ってコンテンツが更新されない
- amplify publish で更新されない時は Cloudfront のキャッシュをクリアしよう

- コンテンツ更新した後のキャッシュをクリアする方法（CICDに組み込む）
　- https://dev.classmethod.jp/articles/aws-amazon-cloudfront-deleting-cache-by-invalidation/
- 動的サイトのキャッシュを気にしてるならttlを0にする
　　- https://dev.classmethod.jp/articles/aws-amazon-cloudfront-no-cache-by-ttl-setting/

### Cloudfront の CORS エラー
- Cache Based on Selected Request Headers を whitelist にして Origin を追加する
　- https://qiita.com/b_a_a_d_o/items/2fa94f5e929b396a24ad

### env の値
- REACT_APP_COGNITO_REGION
　- リージョンを指定する
- REACT_APP_COGNITO_USERPOOLID
　- Cognitoコンソールから ID を確認
- REACT_APP_COGNITO_CLIENTID
　- ユーザープール→アプリクライアントの設定→アプリクライアントのIDを確認（乱数）
- REACT_APP_COGNITO_IDENTITYPOOLID
　- Cognitoコンソールから ID を確認