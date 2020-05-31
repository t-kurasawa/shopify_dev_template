import React from 'react';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import { parse } from 'query-string';
import axiosBase from 'axios';

class Callback extends React.Component {

  async oauth(query){
    const axios = axiosBase.create({
      baseURL: process.env.REACT_APP_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
    const res = await axios.get(`/oauth?code=${query.code}&shop=${query.shop}&hmac=${query.hmac}&state=${query.state}&timestamp=${query.timestamp}`)
    return res
  }

  async componentDidMount() {
    /**
     *  Step 3: Confirm installation
     *  3-1. Shopify アプリインストール確認画面で同意したら callback される
     *  https://d1bpfuwv4m9tq9.cloudfront.net/callback
     *  ?code=65895973e4ef8b6d6f16a238200b3a98
     *  &hmac=7fe44a1d3e2c0f441429c930c931e30a43a55ae9fbd317a571d0cb8dad5fdb6e
     *  &shop=dev-re-dx.myshopify.com
     *  &timestamp=1588511369
     */
    const query = parse(this.props.location.search);
    /**
     *  3-2.hmac の検証
     *  3-3.access_token,scope の取得と永続化
     */
    const token = await this.oauth(query)

    /**
     *  Redirect
     */
    const redirectUri = `https://${query.shop}/admin/apps/${process.env.REACT_APP_SHOPIFY_API_KEY}/top`
    window.location.assign(redirectUri);
  }  

  render() {
    return (
      <div className="Callback">callback</div>
    )
  }
}

export default Callback;
