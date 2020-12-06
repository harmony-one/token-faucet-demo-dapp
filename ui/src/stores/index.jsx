import config from '../config';
import async from 'async'
import {
  ERROR,
  CONFIGURE,
  CONFIGURE_RETURNED,
  GET_BALANCES,
  GET_BALANCES_RETURNED,
  GET_BALANCES_PERPETUAL,
  GET_BALANCES_PERPETUAL_RETURNED,
  WalletConnectionError
} from '../constants';

import { OneWalletConnector } from '@harmony-react/onewallet-connector'
import { MathWalletConnector } from '@harmony-react/mathwallet-connector'

import { Hmy } from '../blockchain';

import { toBech32 } from '@harmony-js/crypto'

const Dispatcher = require('flux').Dispatcher
const Emitter = require('events').EventEmitter

const dispatcher = new Dispatcher()
const emitter = new Emitter()

class Store {
  constructor() {
    const hmy = new Hmy(config.network);
    const onewallet = new OneWalletConnector({ chainId: hmy.client.chainId })
    const mathwallet = new MathWalletConnector({ chainId: hmy.client.chainId })

    this.store = {
      votingStatus: false,
      governanceContractVersion: 2,
      currentBlock: 0,
      universalGasPrice: '70',
      account: {},
      web3: null,
      hmy: hmy,
      onewallet: onewallet,
      mathwallet: mathwallet,
      wallet: null,
      connectorsByName: {
        OneWallet: onewallet,
        MathWallet: mathwallet,
      },
      tokens: [
        {
          address: config.addresses.token,
          name: 'TestToken',
          symbol: 'TST',
          decimals: 18,
          balance: 0
        }
      ],
      web3context: null,
      languages: [
        {
          language: 'English',
          code: 'en'
        }
      ]
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE:
            this.configure(payload);
            break;
          case GET_BALANCES:
            this.getBalances(payload);
            break;
          case GET_BALANCES_PERPETUAL:
            this.getBalancesPerpetual(payload);
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return(this.store[index]);
  };

  setStore(obj) {
    this.store = {...this.store, ...obj}
    return emitter.emit('StoreUpdated');
  };

  async getWallet() {
    var wallet = null;

    const wallets = [
      this.getStore('wallet'),
      this.getStore('onewallet'),
      this.getStore('mathwallet')
    ];

    for (const potentialWallet of wallets) {
      if (potentialWallet) {
        try {
          const isAuthorized = await potentialWallet.isAuthorized();
    
          if (isAuthorized) {
            const account = await potentialWallet.getAccount();
            
            if (account) {
              wallet = potentialWallet;
              this.setStore({ 
                wallet: wallet,
                account: { address: account, bech32Address: toBech32(account) } 
              });
            }
            break;
          }
        } catch (error) {}
      }
    }

    return wallet;
  }

  configure = async () => {
    const hmy = store.getStore('hmy');
    let currentBlock = await hmy.getBlockNumber();

    store.setStore({ currentBlock: currentBlock });

    window.setTimeout(() => {
      emitter.emit(CONFIGURE_RETURNED)
    }, 100)
  }

  getBalancesPerpetual = async () => {
    const tokens = store.getStore('tokens');
    const account = store.getStore('account');

    const hmy = store.getStore('hmy');

    const currentBlock = await hmy.getBlockNumber();

    store.setStore({ currentBlock: currentBlock })

    async.map(tokens, (token, callback) => {
      async.parallel([
        (callback) => { this.getERC20Balance(hmy, token, account, callback) },
      ], (err, data) => {
        if(err) {
          console.log(err)
          return callback(err)
        }

        token.balance = data[0]
        callback(null, token)
      })
    }, (err, tokenData) => {
      if(err) {
        console.log(err)
        return emitter.emit(ERROR, err)
      }
      store.setStore({tokens: tokenData})
      emitter.emit(GET_BALANCES_PERPETUAL_RETURNED)
      emitter.emit(GET_BALANCES_RETURNED)
    })
  }

  getBalances = () => {
    const tokens = store.getStore('tokens');
    const account = store.getStore('account');
    const hmy = store.getStore('hmy');

    async.map(tokens, (token, callback) => {
      async.parallel([
        (callback) => { this.getERC20Balance(hmy, token, account, callback) },
      ], (err, data) => {
        if(err) {
          console.log(err)
          return callback(err)
        }

        token.balance = data[0]
        callback(null, token)
      })
    }, (err, tokenData) => {
      if(err) {
        console.log(err)
        return emitter.emit(ERROR, err)
      }
      store.setStore({tokens: tokenData})
      emitter.emit(GET_BALANCES_RETURNED)
    })
  }

  getERC20Balance = async (hmy, token, account, callback) => {
    if (account && account.address) {
      let erc20Contract = hmy.client.contracts.createContract(require('../abi/ERC20.json'), token.address)

      try {
        var balance = await erc20Contract.methods.balanceOf(account.address).call(hmy.gasOptions())
        balance = parseFloat(balance)/10**token.decimals
        callback(null, Math.ceil(balance))
      } catch(err) {
        console.log(err)
        return callback(err)
      }
    } else {
      callback(null);
    }
  }

  useFaucet = async () => {
    const hmy = store.getStore('hmy');
    const account = store.getStore('account')
    const context = store.getStore('web3context')
    var connector = null

    if (context) {
      connector = context.connector
    }

    if (!connector) {
      throw new WalletConnectionError('No wallet connected')
    }

    let faucetContract = hmy.client.contracts.createContract(require('../abi/Faucet.json'), config.addresses.faucet)
    faucetContract = await connector.attachToContract(faucetContract)
    return faucetContract.methods.fund(account.address).send({ ...hmy.gasOptions(), from: account.address })
  }
}

const store = new Store();
const stores = {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
}
export default stores;
