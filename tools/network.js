'use strict';

const Web3 = require('web3');
require("dotenv").config();
const { Harmony } = require("@harmony-js/core");

module.exports = class Network {
  constructor(network) {
    this.network = '';
    this.url = ''
    this.client = null;
    this.privateKeys = {deployer: null, tester: null};
    this.wallet = '';
    
    this.setNetwork(network);
    this.gasPrice = process.env.GAS_PRICE;
    this.gasLimit = process.env.GAS_LIMIT;
  }

  setNetwork(network) {
    this.network = network.toLowerCase();
    
    switch (this.network) {
      case 'localnet':
      case 'local':
        this.network = 'localnet';
        this.url = 'http://localhost:9500';
        break

      case 'testnet':
        this.url = "https://api.s0.b.hmny.io";
        break;
      
      case 'mainnet':
        this.url = "https://api.s0.t.hmny.io";
        break;
      
      case 'ropsten':
        this.url = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`;
        break;

      case 'rinkeby':
        this.url = `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`
        break;

      case 'kovan':
        this.url = `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`
        break;
      
      default:
        console.log('Please enter a valid network');
        throw new Error('NetworkRequired');
    }

    this.client = new Web3(this.url);

    this.privateKeys = {
      deployer: process.env[`${this.network.toUpperCase()}_PRIVATE_KEY`],
      tester: process.env[`${this.network.toUpperCase()}_TEST_ACCOUNT_PRIVATE_KEY`],
    }
  }

  loadContract(path, address, privateKeyType) {
    let contract = null;
    let privateKey = null;

    switch (privateKeyType) {
      case 'deployer':
      case 'tester':
        privateKey = this.privateKeys[privateKeyType]
        break;

      default:
        privateKey = privateKeyType;
    }

    const contractJson = require(path);
    contract = new this.client.eth.Contract(contractJson.abi, address)

    if (privateKey != null && privateKey != '') {
      const account = this.client.eth.accounts.privateKeyToAccount(privateKey);
      this.client.eth.accounts.wallet.add(privateKey);
      this.client.eth.defaultAccount = account.address;
      this.wallet = account.address;
    }

    return contract;
  }
}
