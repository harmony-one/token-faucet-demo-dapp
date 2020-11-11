import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  CircularProgress
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import {
  ERROR,
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTED
} from '../../constants'

import Store from "../../stores";
const emitter = Store.emitter
const store = Store.store

const styles = theme => ({
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
    position: 'fixed',
    right: '12px',
    top: '12px',
    cursor: 'pointer'
  }
});

class Unlock extends Component {

  constructor(props) {
    super()

    this.state = {
      error: null,
      metamaskLoading: false,
      ledgerLoading: false
    }
  }

  componentDidMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(ERROR, this.error);
  };

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(ERROR, this.error);
  };

  error = (err) => {
    this.setState({ loading: false, error: err, metamaskLoading: false, ledgerLoading: false })
  };

  connectionConnected = () => {
    if(this.props.closeModal != null) {
      this.props.closeModal()
    }
  }

  connectionDisconnected = () => {
    if(this.props.closeModal != null) {
      this.props.closeModal()
    }

    //this.props.history.push('/') // state isn't fully reset
    window.location.reload();
  }

  render() {
    const { classes, closeModal, t } = this.props;

    return (
      <div className={ classes.root }>
        <div className={ classes.closeIcon } onClick={ closeModal }><CloseIcon /></div>
        <div className={ classes.contentContainer }>
        </div>
      </div>
    )
  };
}

function onConnectionClicked(currentConnector, name, setActivatingConnector, activate) {
  const connectorsByName = store.getStore('connectorsByName')
  setActivatingConnector(currentConnector);
  activate(connectorsByName[name]);
}

function onDeactivateClicked(deactivate, connector) {
  if(deactivate) {
    deactivate()
  }

  if (connector && connector.signOut) {
    connector.signOut().then(() => {
      store.setStore({ account: { } })
      emitter.emit(CONNECTION_DISCONNECTED)
    });
  }

  /*if(connector && connector.close) {
    connector.close()
  }*/
}

function MyComponent(props) {
  var connectorsByName = store.getStore('connectorsByName');
  const connector = connectorsByName["OneWallet"];

  const { closeModal } = props

  const [activatingConnector, setActivatingConnector] = React.useState();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  React.useEffect(() => {
    if (account && active && library) {
      store.setStore({ account: { address: account }, web3context: context })
      emitter.emit(CONNECTION_CONNECTED)
    }
  }, [account, active, closeModal, context, library]);

  // React.useEffect(() => {
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

        var url;
        var display = name;

        if (name === 'OneWallet') {
          url = require('../../assets/harmony.png')
        } else if (name === 'MathWallet') {
          url = require('../../assets/mathwallet.png')
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
              onClick={() => {
                onConnectionClicked(currentConnector, name, setActivatingConnector, activate)
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
              { (!activating && connected) && <div style={{ background: '#4caf50', borderRadius: '10px', width: '10px', height: '10px', marginRight: '10px' }}></div> }
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
          onClick={() => { onDeactivateClicked(deactivate, connector); }}>
          <Typography style={ {
              marginLeft: '12px',
              fontWeight: '700',
              color: '#DC6BE5'
            } }
            variant={ 'h5'}
            color='primary'>
            Log out
          </Typography>
        </Button>
      </div>
    </div>
  )

}

export default (withRouter(withStyles(styles)(Unlock)));
