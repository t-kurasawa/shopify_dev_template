# README
- Shopify プロジェクトのベースリポジトリ

# themekit
- [Theme Kit](https://shopify.github.io/themekit/#manual-installation) をインストール
- [Shopify Theme Kit でテーマを開発する](https://qiita.com/t-kurasawa/items/21f887fea399c0d07529)を参考に環境構築を行う

## config.yml の作成
`theme configure -p=パスワード -s=ストア名.myshopify.com -t=テーマID`

# shopify-app-cli
- [Shopify App cli](https://github.com/Shopify/shopify-app-cli) をインストール
- [Shopify App CLI でアプリを開発する](https://qiita.com/t-kurasawa/items/1b18a7afd6fc854e70b7)を参考に環境構築を行う

# app
- [Shopify アプリを AWS に SPA + Serverless 構成でデプロイする – React + Amplify / Node.js + Serverless Framework –](https://qiita.com/t-kurasawa/items/e8c15e33ae9055146206)

## react-amplified
- フロントエンドを担う。React を Amplify でホスティングする
- [create-react-app と Amplify の開発環境](./app/react-amplified/README.md)

## api-serverless
- バックエンドを担う。Serverless Framework で Cognito , API Gateway - Lambda - DynamoDB をビルドする
- [Serverless Framework の環境構築](./app/api-serverless/README.md)
