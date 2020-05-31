console.log('----app.js----')
var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var axiosBase = require('axios')
var Shopify = require('shopify-api-node');
var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var checkSignature = require('./util/shopifySignature.js')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())
/**
 * Enable All CORS Requests
 * https://expressjs.com/en/resources/middleware/cors.html
*/ 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers", 
    "\
    Authorization, \
    Content-Type, \
    X-Amz-Date, \
    X-Api-Key, \
    X-Amz-Security-Token, \
    X-Amz-User-Agent \
    "
  )
  next()
});

/**********************
 * get method *
 **********************/

app.get(`${process.env.PUBLIC_API_URL}/oauth`, (req, res) =>{
  // Add your code here
  console.log('----GET /oauth----')
  /**
   *  Step 3: Confirm installation
   *  3-2:hmac の検証
   */
  if(!checkSignature(req.apiGateway.event.queryStringParameters)){
    console.log('invalid signature')
    res.json({error: 'invalid signature'})
  }
  /**
   *   3-3.access_token,scope の取得と永続化
   */
  const code = req.apiGateway.event.queryStringParameters.code
  const shopOrigin = req.apiGateway.event.queryStringParameters.shop
  const access_token_endpoint=`https://${shopOrigin}/admin/oauth/access_token`
  const axios = axiosBase.create({
    baseURL: access_token_endpoint,
    headers: {
      'Content-Type': 'application/json'
    },
    responseType: 'json'
  })
  axios.post('/',{
    client_id:process.env.SHOPIFY_API_KEY,
    client_secret:process.env.SHOPIFY_API_SECRET,
    code:code
  }).then(response=>{
    //shop_id と token を永続化
    //TODO: token を暗号化
    var table = "Tokens";
    var params = {
      TableName: table,
      Item:{
        shop_id:shopOrigin,
        token:JSON.stringify(response.data)
      }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            //tokenを返却
            res.json(response.data)
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            //tokenを返却
            res.json(response.data)
        }
    });
  }).catch(err=>{
    console.log(err)
    res.json({error: err})
  })
});

app.get(`${process.env.PUBLIC_API_URL}/shop/exist`, (req, res) =>{
  console.log('----GET /shop/exist----')
  // TODO: Shop が token を持っているかを判定する
  var table = "Tokens";
  var params = {
    TableName: table,
    Key:{
      shop_id:req.apiGateway.event.queryStringParameters.shop,
    }
  };
  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.json(err)
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        res.json({exist:true})
    }
  });
});

app.get(`${process.env.PRIVATE_API_URL}/products`, (req, res) =>{
  console.log('----GET /products----')
  // TODO: Shop 情報はパラメータではなく、認証されたユーザーとshopidを紐づけて管理すること
  // TODO: Dynamo は model 化する
  var table = "Tokens";
  var params = {
    TableName: table,
    Key:{
      shop_id:req.apiGateway.event.queryStringParameters.shop,
    }
  };
  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.json(err)
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        const token = JSON.parse(data.Item.token)
        // Shopify instance
        var shopify = new Shopify({
          shopName: req.apiGateway.event.queryStringParameters.shop,
          accessToken: token.access_token,
          apiVersion: '2020-04',
        });
        // Add your code here
        var params = { limit: 10 };
        shopify.product
          .list(params)
          .then((list) => res.json({products:list}))
          .catch((err) => res.json({products:err}));
    }
  });
});

app.get(`${process.env.PRIVATE_API_URL}/products/*`, (req, res) =>{
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* post method *
****************************/

app.post(`${process.env.PRIVATE_API_URL}/products`, (req, res) =>{
  console.log('----POST /products----')
  // TODO: Shop 情報はパラメータではなく、認証されたユーザーとshopidを紐づけて管理すること
  // TODO: Dynamo は model 化する
  var table = "Tokens";
  var params = {
    TableName: table,
    Key:{
      shop_id:req.apiGateway.event.queryStringParameters.shop,
    }
  };
  docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.json(err)
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        const token = JSON.parse(data.Item.token)
        // Shopify instance
        var shopify = new Shopify({
          shopName: req.apiGateway.event.queryStringParameters.shop,
          accessToken: token.access_token,
          apiVersion: '2020-04',
        });
        // Add your code here
        var param = {
          title: req.body.title,
          body_html: req.body.body_html,
          vendor: req.body.vendor,
          tags: req.body.tags
        }
        shopify.product
          .create(param)
          .then((item) => res.json({product:item}))
          .catch((err) => res.json({product:err}));
    }
  });
});

app.post(`${process.env.PRIVATE_API_URL}/products/*`, (req, res) =>{
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* put method *
****************************/

app.put(`${process.env.PRIVATE_API_URL}/products`, (req, res) =>{
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put(`${process.env.PRIVATE_API_URL}/products/*`, (req, res) =>{
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* delete method *
****************************/

app.delete(`${process.env.PRIVATE_API_URL}/products`, (req, res) =>{
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete(`${process.env.PRIVATE_API_URL}/products/*`, (req, res) =>{
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
