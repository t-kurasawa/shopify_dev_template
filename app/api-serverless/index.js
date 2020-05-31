'use strict';
const awsServerlessExpress = require('aws-serverless-express');
const app = require('./functions/app.js');

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  awsServerlessExpress.proxy(server, event, context);
};