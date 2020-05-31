import React from 'react';
import { AppProvider } from '@shopify/polaris'
import translations from "@shopify/polaris/locales/ja.json";
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Auth from './Auth'
import Callback from './Callback'
import Top from './Top'

class App extends React.Component{
  render(){
    return (
      <AppProvider i18n={translations}>
        <BrowserRouter>
          <Switch>
              <Route path='/top' component={Top} />
              <Route path='/auth' component={Auth} />
              <Route path='/callback' component={Callback} />
          </Switch>
        </BrowserRouter>
      </AppProvider>
    );
  }
}

export default App;
