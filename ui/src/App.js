import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Switch,
  Route
} from "react-router-dom";
import IpfsRouter from 'ipfs-react-router'

import interestTheme from './theme';

import Account from './components/account';
import Home from './components/home';
import Header from './components/header';

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  CONFIGURE,
  CONFIGURE_RETURNED,
  GET_BALANCES_PERPETUAL,
  GET_BALANCES_PERPETUAL_RETURNED
} from './constants'

import Store from "./stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

export default function App() {
  const [account, setAccount] = useState(null)

  useEffect(() => {
    const getBalancesReturned = () => {
      window.setTimeout(() => {
        dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
      }, 5000)
    }
  
    const configureReturned = () => {
      //dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
    }
  
    const connectionConnected = () => {
      setAccount(store.getStore('account'))
      dispatcher.dispatch({ type: CONFIGURE, content: {} })
      dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
    };
  
    const connectionDisconnected = () => {
      setAccount(store.getStore('account'))
    }

    emitter.on(CONNECTION_CONNECTED, connectionConnected)
    emitter.on(CONNECTION_DISCONNECTED, connectionDisconnected)
    emitter.on(CONFIGURE_RETURNED, configureReturned)
    emitter.on(GET_BALANCES_PERPETUAL_RETURNED, getBalancesReturned)

    return () => {
      emitter.removeListener(CONNECTION_CONNECTED, connectionConnected);
      emitter.removeListener(CONNECTION_DISCONNECTED, connectionDisconnected);
      emitter.removeListener(CONFIGURE_RETURNED, configureReturned);
      emitter.removeListener(GET_BALANCES_PERPETUAL_RETURNED, getBalancesReturned);
    }
  }, [])

  return (
    <MuiThemeProvider theme={ createMuiTheme(interestTheme) }>
      <CssBaseline />
      <IpfsRouter>
        { !account &&
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            minWidth: '100vw',
            justifyContent: 'center',
            alignItems: 'center',
            background: "#f9fafb"
          }}>
            <Account />
          </div>
        }
        { account &&
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
            background: "#f9fafb"
          }}>
            <Switch>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        }
        { account && <Header /> }
      </IpfsRouter>
    </MuiThemeProvider>
  )
}
