import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Card,
  Typography,
} from '@material-ui/core';
import { colors } from '../../theme'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';

import Loader from '../loader'
import Snackbar from '../snackbar'

// Added
import config from "../../config";
import Store from "../../stores";
const store = Store.store

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    }
  },
  card: {
    flex: '1',
    height: '25vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    cursor: 'pointer',
    borderRadius: '0px',
    transition: 'background-color 0.2s linear',
    [theme.breakpoints.up('sm')]: {
      height: '100vh',
      minWidth: '20%',
      minHeight: '50vh',
    }
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
  title: {
    padding: '24px',
    paddingBottom: '0px',
    [theme.breakpoints.up('sm')]: {
      paddingBottom: '24px'
    }
  },
  icon: {
    fontSize: '60px',
    [theme.breakpoints.up('sm')]: {
      fontSize: '100px',
    }
  },
  link: {
    textDecoration: 'none'
  }
});

class Home extends Component {

  constructor(props) {
    super()

    this.state = {
      snackbarMessage: null,
      snackbarType: null,
      loading: false,
    }
  }

  render() {
    const { classes } = this.props;

    const {
      snackbarMessage,
      loading
    } = this.state

    return (
      <div className={ classes.root }>
        <Card className={ `${classes.card} ${classes.green}` } onClick={ () => { this.faucet() } }>
          <AttachMoneyIcon className={ `${classes.icon} icon` } />
          <Typography variant={'h3'} className={ `${classes.title} title` }>Faucet</Typography>
        </Card>
        { loading && <Loader /> }
        { snackbarMessage && this.renderSnackbar() }
      </div>
    )
  };

  nav = (screen) => {
    this.props.history.push(screen)
  }

  renderSnackbar = () => {
    var {
      snackbarType,
      snackbarMessage
    } = this.state
    return <Snackbar type={ snackbarType } message={ snackbarMessage } open={true}/>
  };

  faucet = async () => {
    const hmy = store.getStore('hmy');
    const wallet = store.getWallet();
    const account = store.getStore('account');

    let faucetContract = hmy.client.contracts.createContract(require('../../abi/Faucet.json'), config.addresses.faucet);
    faucetContract = wallet.attachToContract(faucetContract);

    this.setState({ snackbarMessage: null, snackbarType: null, loading: true })

    await faucetContract.methods.fund(account.address).send({ ...hmy.gasOptions(), from: account.address })
    .then((res) => {
      if (res.status === 'called' || res.status === 'call') {
        const url = `${hmy.explorerUrl}/tx/${res.transaction.receipt.transactionHash}`
        this.setState({ snackbarMessage: url, snackbarType: "Hash", loading: false })
      } else {
        this.setState({ snackbarMessage: "An error occurred :(. Please try again!", snackbarType: "Error", loading: false })
      }
    })
    .catch(function(err){
      this.setState({ snackbarMessage: "An error occurred :(. Please try again!", snackbarType: "Error", loading: false })
    });
  }

}

export default (withRouter(withStyles(styles)(Home)));
