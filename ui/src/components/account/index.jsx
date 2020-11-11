import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
} from '@material-ui/core';

import { transparentize } from 'polished'

import { colors } from '../../theme'

import harmonyLogo from '../../assets/harmony.png';

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  CONFIGURE_RETURNED
} from '../../constants/'

import Store from "../../stores/";
const emitter = Store.emitter
const store = Store.store

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    //background: colors.compoundGreen,
    minWidth: '100vw',
    padding: '36px 24px',
    backgroundPosition: '0 -10vh',
    backgroundImage: `radial-gradient(50% 50% at 50% 50%, ${transparentize(0.9, '#00AEE9')} 0%, ${transparentize(1, '#FFFFFF')} 100%)`,
    //backgroundImage: `linear-gradient(${transparentize(0.9, '#00AEE9')}, ${transparentize(1, '#FFFFFF')})`
  },
  connectHeading: {
    maxWidth: '400px',
    textAlign: 'center',
    color: '#00AEE9'
  },
  connectContainer: {
    padding: '20px'
  },
  actionButton: {
    background: '#bcecfd',
    color: '#00AEE9',
    borderColor: '#00AEE9'
  },
  notConnectedRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedRoot: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%'
  },
  address: {
    color: colors.white,
    width: '100%',
    paddingBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  balances: {
    color: colors.white,
    width: '100%',
    padding: '12px'
  },
  balanceContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between'
  },
  accountHeading: {
    paddingBottom: '6px'
  },
  icon: {
    cursor: 'pointer'
  },
  disclaimer: {
    padding: '12px',
    border: '1px solid '+colors.white,
    borderRadius: '0.75rem',
    marginBottom: '24px',
    fontWeight: 1,
    color: colors.white,
    background: colors.red
  }
});

class Account extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')

    this.state = {
      loading: false,
      account: account,
      assets: store.getStore('assets'),
      modalOpen: false,
    }
  }
  componentDidMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(CONFIGURE_RETURNED, this.configureReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
  };

  connectionConnected = () => {
    //this.setState({ account: store.getStore('account') })
  };

  configureReturned = () => {
    // this.props.history.push('/')
  }

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account'), loading: false })
  }

  errorReturned = (error) => {
    //TODO: handle errors
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={ classes.root }>
        { this.renderNotConnected() }
      </div>
    )
  };

  renderNotConnected = () => {
    const { classes } = this.props
    const { loading } = this.state

    return (
      <div className={ classes.notConnectedRoot }>
        <div className={ classes.connectHeading }>
        <Typography variant='h2'>Token faucet demo dApp on Harmony</Typography>
        <img src={harmonyLogo} />
        <Typography variant='h4'>Connect a wallet to continue</Typography>
        </div>
        <div className={ classes.connectContainer }>
          <Button
            className={ classes.actionButton }
            variant=""
            color="primary"
            onClick={() => this.unlockClicked('onewallet')}
            disabled={ loading }
            >
            <Typography>Connect OneWallet</Typography>
          </Button><br /><br />
          <Button
            className={ classes.actionButton }
            variant=""
            color="primary"
            onClick={() => this.unlockClicked('mathwallet')}
            disabled={ loading }
            >
            <Typography>Connect MathWallet</Typography>
          </Button>
        </div>
      </div>
    )
  }

  unlockClicked = (walletType) => {
    const wallet = store.getStore(walletType);
    
    wallet.signIn().then(() => {
      store.setStore({ wallet: wallet, account: { address: wallet.base16Address, bech32Address: wallet.address } })
      emitter.emit(CONNECTION_CONNECTED)
    });

    //this.setState({ modalOpen: true, loading: true })
  }

  closeModal = () => {
    this.setState({ modalOpen: false, loading: false })
  }
}

export default withRouter(withStyles(styles)(Account));
