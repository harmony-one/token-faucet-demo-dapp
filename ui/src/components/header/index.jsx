import React, { Component } from "react";
import {
  Typography,
  Button
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { colors } from "../../theme";

import {
  CONNECTION_DISCONNECTED,
  GET_BALANCES_PERPETUAL_RETURNED
} from '../../constants'

import Store from "../../stores";
const store = Store.store
const emitter = Store.emitter

const styles = theme => ({
  headerContainer: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 999
  },
  actionButton: {
    color: colors.white,
    borderColor: colors.white
  },
  green: {
    backgroundColor: colors.white,
    '&:hover': {
      backgroundColor: colors.compoundGreen,
      '& .title': {
        color: colors.white,
      },
      '& .icon': {
        color: colors.white
      }
    },
    '& .title': {
      color: colors.compoundGreen,
    },
    '& .icon': {
      color: colors.compoundGreen
    },
  },
})

class Header extends Component {

  constructor(props) {
    super()

    this.state = {
      loading: false,
    }
  }

  componentDidMount() {
    emitter.on(GET_BALANCES_PERPETUAL_RETURNED, this.getBalancesReturned);
  };

  componentWillUnmount() {
    emitter.removeListener(GET_BALANCES_PERPETUAL_RETURNED, this.getBalancesReturned);
  };

  getBalancesReturned = () => {
    this.setState({ loading: false })
  }

  render() {
    const { classes } = this.props
    const { loading } = this.state

    const tokens = store.getStore('tokens');
    const tokenBalance = (tokens && tokens.length >= 1) ? tokens[0].balance : 0;

    return (
      <div className={ classes.headerContainer }>
        <Button
          className={ classes.green }
          variant="outlined"
          color="primary"
          disabled={ true }
          >
          <Typography>{ tokenBalance } TST</Typography>
        </Button>
        <Button
          className={ classes.green }
          variant="outlined"
          color="primary"
          onClick={ this.signoutClicked }
          disabled={ loading }
          >
          <Typography>Disconnect</Typography>
        </Button>
      </div>
    );
  }

  signoutClicked = () => {
    const wallet = store.getWallet();
    
    if (wallet) {
      wallet.signOut().then(() => {
        store.setStore({ wallet: null, account: null })
        emitter.emit(CONNECTION_DISCONNECTED)
      });
    }
  }
}

export default (withStyles(styles)(Header));
