import React from 'react';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import { parse } from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import axiosBase from 'axios';

class Auth extends React.Component {

  async shopExist(shopOrigin){
    const axios = axiosBase.create({
      baseURL: process.env.REACT_APP_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
    const res = await axios.get('/shop/exist'+'?shop='+ shopOrigin)
    if(res.data.exist){
      return true
    }else{
      return false
    }
  }

  async componentDidMount(){
    const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;
    const scope = process.env.REACT_APP_SCOPES;
    const query = parse(this.props.location.search);
    const shopOrigin = query.shop;

    /**
     *  Shop 登録済ならばアプリトップへリダイレクト
     */
    const shopExist = await this.shopExist(shopOrigin)
    if(shopExist){
      // If the current window is the 'parent', change the URL by setting location.href      
      if (window.top === window.self) {
        window.location.assign(process.env.REACT_APP_APPLICATION_URL + '/top');
      // If the current window is the 'child', change the parent's URL with Shopify App Bridge's Redirect action
      } else {
        const app = createApp({
          apiKey: apiKey,
          shopOrigin: shopOrigin
        });
        Redirect.create(app).dispatch(Redirect.Action.ADMIN_PATH, process.env.REACT_APP_APPLICATION_URL + '/top');
      }
    }
    /**
     * READ this document -> https://shopify.dev/tutorials/authenticate-with-oauth
     * Step 1: Get client credentials
     * Step 2: Ask for permission
     *  https://app.cloudfront.net/auth
     *  ?hmac=hmacrandomkey
     *  &shop=dev-yourshopname.myshopify.com
     *  &timestamp=unixtimestamp
     */
    const nonce = uuidv4()
    const access_mode = 'offline'
    const redirectUri = process.env.REACT_APP_APPLICATION_URL + '/callback';
    const permissionUrl = `https://${shopOrigin}/admin/oauth/authorize?client_id=${apiKey}&scope=${scope}&redirect_uri=${redirectUri}&state=${nonce}&grant_options[]=${access_mode}`;
    if (window.top === window.self) {
      window.location.assign(permissionUrl);
    // If the current window is the 'child', change the parent's URL with Shopify App Bridge's Redirect action
    } else {
      const app = createApp({
        apiKey: apiKey,
        shopOrigin: shopOrigin
      });
      Redirect.create(app).dispatch(Redirect.Action.REMOTE, permissionUrl);
    }
  }

  render() {
    return (
      <div className="Auth">auth</div>
    )
  }
}

export default Auth;
