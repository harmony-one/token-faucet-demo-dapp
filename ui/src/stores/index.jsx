import config from '../config'
import async from 'async'
import {
  ERROR,
  CONFIGURE,
  CONFIGURE_RETURNED,
  GET_BALANCES,
  GET_BALANCES_RETURNED,
  GET_BALANCES_PERPETUAL,
  GET_BALANCES_PERPETUAL_RETURNED,
  CONNECTION_DISCONNECTED
} from '../constants'

import Web3 from 'web3';

import {
  injected,
  //walletconnect,
  //walletlink,
  ledger,
  trezor,
  //frame,
  //fortmatic,
  //portis,
  //squarelink,
  //torus,
  //authereum
} from "./connectors"

const Dispatcher = require('flux').Dispatcher
const Emitter = require('events').EventEmitter

const dispatcher = new Dispatcher()
const emitter = new Emitter()

class Store {
  constructor() {

    this.store = {
      votingStatus: false,
      governanceContractVersion: 2,
      currentBlock: 0,
      universalGasPrice: '100',
      account: {},
      web3: null,
      web3context: null,
      connectorsByName: {
        MetaMask: injected,
        //TrustWallet: injected,
        //WalletConnect: walletconnect,
        //WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        //Frame: frame,
        //Fortmatic: fortmatic,
        //Portis: portis,
        //Squarelink: squarelink,
        //Torus: torus,
        //Authereum: authereum
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
            this.configure(payload)
            break
          case GET_BALANCES:
            this.getBalances(payload)
            break
          case GET_BALANCES_PERPETUAL:
            this.getBalancesPerpetual(payload)
            break
          default: {
          }
        }
      }.bind(this)
    )
  }

  getStore(index) {
    return(this.store[index])
  }

  setStore(obj) {
    this.store = {...this.store, ...obj}
    return emitter.emit('StoreUpdated')
  }

  configure = async () => {
    const web3 = new Web3(store.getStore('web3context').library.provider)
    let currentBlock = await web3.eth.getBlockNumber()

    store.setStore({ currentBlock: currentBlock })

    window.setTimeout(() => {
      emitter.emit(CONFIGURE_RETURNED)
    }, 100)
  }

  getGasSettings = () => {
    return config.gas
  }

  getBalancesPerpetual = async () => {
    const tokens = store.getStore('tokens')
    const account = store.getStore('account')
    const web3context = store.getStore('web3context')

    if (!web3context) {
      emitter.emit(CONNECTION_DISCONNECTED)
      return
    }

    const web3 = new Web3(web3context.library.provider)
    const currentBlock = await web3.eth.getBlockNumber()

    store.setStore({ currentBlock: currentBlock })

    async.map(tokens, (token, callback) => {
      async.parallel([
        (callback) => { this.getERC20Balance(web3, token, account, callback) }
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
    const tokens = store.getStore('tokens')
    const account = store.getStore('account')
    const web3 = new Web3(store.getStore('web3context').library.provider)

    async.map(tokens, (token, callback) => {
      async.parallel([
        (callback) => { this.getERC20Balance(web3, token, account, callback) }
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

  getERC20Balance = async (web3, token, account, callback) => {
    if (account && account.address) {
      let erc20Contract = new web3.eth.Contract(require('../abi/ERC20.json'), token.address)

      try {
        var balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
        balance = parseFloat(balance)/10**token.decimals
        callback(null, Math.ceil(balance))
      } catch(err) {
        console.log(err)
        return callback(err)
      }
    } else {
      callback(null)
    }
  }

  useFaucet = async () => {
    const web3 = new Web3(store.getStore('web3context').library.provider)
    const account = store.getStore('account')
    const faucetContract = new web3.eth.Contract(require('../abi/Faucet.json'), config.addresses.faucet)
    const gasSettings = this.getGasSettings()
    
    return faucetContract.methods.fund(account.address).send({ from: account.address, gasPrice: gasSettings.price, gasLimit: gasSettings.limit })
  }
}

const store = new Store()
const stores = {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
}
export default stores
