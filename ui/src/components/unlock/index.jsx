import React, { useState, useEffect } from "react"
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'

import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from "@ethersproject/providers"

import {
  ERROR,
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTED
} from '../../constants'

import WalletComponent from './walletComponent.jsx';

import Store from "../../stores";
const emitter = Store.emitter

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1,
    height: 'auto',
    display: 'flex',
    position: 'relative'
  },
  contentContainer: {
    margin: 'auto',
    textAlign: 'center',
    padding: '12px',
    display: 'flex',
    flexWrap: 'wrap'
  },
  cardContainer: {
    marginTop: '60px',
    minHeight: '260px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  unlockCard: {
    padding: '24px'
  },
  buttonText: {
    marginLeft: '12px',
    fontWeight: '700',
  },
  instruction: {
    maxWidth: '400px',
    marginBottom: '32px',
    marginTop: '32px'
  },
  actionButton: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '3rem',
    border: '1px solid #E1E1E1',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      padding: '15px',
    }
  },
  connect: {
    width: '100%'
  },
  closeIcon: {
    position: 'absolute',
    right: '0px',
    top: '0px',
    cursor: 'pointer'
  }
}))

export default function Unlock({ closeModal }) {
  const classes = useStyles()
  const [, setError] = useState(null)

  useEffect(() => {
    const errorOccurred = (err) => {
      setError(err)
    };
  
    const connectionConnected = () => {
      if (closeModal != null) {
        closeModal()
      }
    }
  
    const connectionDisconnected = () => {
      if (closeModal != null) {
        closeModal()
      }
    }

    emitter.on(CONNECTION_CONNECTED, connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, connectionDisconnected);
    emitter.on(ERROR, errorOccurred);

    return () => {
      emitter.removeListener(CONNECTION_CONNECTED, connectionConnected)
      emitter.removeListener(CONNECTION_DISCONNECTED, connectionDisconnected)
      emitter.removeListener(ERROR, errorOccurred)
    }
  }, [closeModal])

  const getLibrary = (provider) => {
    var library
  
    if (provider?.chainType === 'hmy') {
      library = provider.blockchain
    } else {
      library = new Web3Provider(provider)
      library.pollingInterval = 8000
    }
  
    return library
  }

  return (
    <div className={ classes.root }>
      <div className={ classes.closeIcon } onClick={ closeModal }><CloseIcon /></div>
      <div className={ classes.contentContainer }>
        <Web3ReactProvider getLibrary={ getLibrary }>
          <WalletComponent closeModal={ closeModal } />
        </Web3ReactProvider>
      </div>
    </div>
  )
}
