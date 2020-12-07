import React, { useEffect } from "react"
import {
  Typography,
  Button,
  CircularProgress
} from '@material-ui/core'

import { useWeb3React } from '@web3-react/core'

import {
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTED
} from '../../constants'

import HarmonyLogo from '../../assets/harmony.png'
import MathWalletLogo from '../../assets/mathwallet.png'

import Store from "../../stores";
const emitter = Store.emitter
const store = Store.store

export default function WalletComponent({ closeModal }) {
  const context = useWeb3React()
  const localContext = store.getStore('web3context')
  var localConnector = null;
  if (localContext) {
    localConnector = localContext.connector
  }
  
  const {
    connector,
    library,
    account,
    activate,
    deactivate,
    active,
    error
  } = context;

  var connectorsByName = store.getStore('connectorsByName')

  const [activatingConnector, setActivatingConnector] = React.useState()
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  useEffect(() => {
    if (account && active && library) {
      store.setStore({ account: { address: account }, web3context: context })
      emitter.emit(CONNECTION_CONNECTED)
    }
  }, [account, active, closeModal, context, library])

  const [hoveredConnectorButtons, setHoveredConnectorButtons] = React.useState(new Map());
  const updateHoveredConnectorButtons = (k,v) => {
    setHoveredConnectorButtons(new Map(hoveredConnectorButtons.set(k,v)))
  }

  const onConnectionClicked = (currentConnector, name, setActivatingConnector, activate) => {
    const connectorsByName = store.getStore('connectorsByName')
    setActivatingConnector(currentConnector);
    activate(connectorsByName[name])
  }
  
  const onDeactivateClicked = (deactivate, connector) => {
    if (deactivate) {
      deactivate()
    }
    if (connector && connector.close) {
      connector.close()
    }
    store.setStore({ account: { }, web3context: null })
    emitter.emit(CONNECTION_DISCONNECTED)
  }

  // useEffect(() => {
  //   if (storeContext && storeContext.active && !active) {
  //     console.log("we are deactive: "+storeContext.account)
  //     store.setStore({ account: {}, web3context: null })
  //   }
  // }, [active, storeContext]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  // const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  // useInactiveListener(!triedEager || !!activatingConnector);
  const width = window.innerWidth

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: (width > 650 ? 'space-between' : 'center'), alignItems: 'center' }}>
      {Object.keys(connectorsByName).map(name => {
        const currentConnector = connectorsByName[name];
        const activating = currentConnector === activatingConnector;
        const connected = (currentConnector === connector||currentConnector === localConnector);
        const disabled =
           !!activatingConnector || !!error;

        const hovered = hoveredConnectorButtons.get(name);
        const dotColor = (connected && !hovered) ? '#4caf50' : '#FF0000';

        var url;
        var display = (hovered && connected) ? 'Disconnect' : name;
        if (name === 'OneWallet') {
          url = HarmonyLogo
        } else if (name === 'MathWallet') {
          url = MathWalletLogo
        }

        return (
          <div key={name} style={{ padding: '12px 0px', display: 'flex', justifyContent: 'space-between'  }}>
            <Button style={ {
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '1rem',
                border: '1px solid #E1E1E1',
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                minWidth: '250px'
              } }
              variant='outlined'
              color='primary'
              onMouseEnter={() => updateHoveredConnectorButtons(name, true) }
              onMouseLeave={() => updateHoveredConnectorButtons(name, false) }
              onClick={() => {
                connected ? onDeactivateClicked(deactivate, currentConnector) : onConnectionClicked(currentConnector, name, setActivatingConnector, activate)
              }}
              disabled={ disabled }>
              <Typography style={ {
                  margin: '0px 12px',
                  color: 'rgb(1, 1, 1)',
                  fontWeight: 500,
                  fontSize: '1rem',
                } }
                variant={ 'h3'}>
                { display }
              </Typography>

              { (!activating && !connected) && <img style={
                {
                  position: 'absolute',
                  right: '20px',

                  width: '30px',
                  height: '30px'
                }
              } src={url} alt=""/> }
              { activating && <CircularProgress size={ 15 } style={{marginRight: '10px'}} /> }
              { (!activating && connected) && <div style={{ background: dotColor, borderRadius: '10px', width: '10px', height: '10px', marginRight: '10px' }}></div> }
            </Button>
          </div>
        )
      }) }

      <div style={{ width: '252px', margin: '12px 0px'  }}>
        <Button style={ {
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #E1E1E1',
            fontWeight: 500,
            minWidth: '250px'
          } }
          variant='outlined'
          color='primary'
          onClick={() => { onDeactivateClicked(deactivate, connector || localConnector); }}>
          <Typography style={ {
              marginLeft: '12px',
              fontWeight: '700',
              color: '#DC6BE5'
            } }
            variant={ 'h5'}
            color='primary'>
            Deactivate
          </Typography>
        </Button>
      </div>
    </div>
  )
}
