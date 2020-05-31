const slsw = require('serverless-webpack');

module.exports = {
  mode: 'development',
  // Serverlessのpackage.individuallyを使用する場合にはentryをserverless-webpackに任せる必要がある(slsw.lib.entries)
  // 基本的に問題は起こらないと思うが、entryが足りない！みたいなケースには下記の様なコードで対応しろとのこと(_はlodashなので適宜導入下さい)
  // entry: _.assign({myCustomEntry1: './custom/path/something.js'}, slsw.lib.entries)
  entry: slsw.lib.entries,
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};