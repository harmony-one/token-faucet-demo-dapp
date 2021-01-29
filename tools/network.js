'use strict';

const Web3 = require('web3');
const Ethers = require('ethers');
require("dotenv").config();

module.exports = class Network {
  constructor(network, type) {
    this.type = '';

    if (type) {
      this.type = type;
    } else {
      this.type = 'web3';
    }

    this.network = '';
    this.url = '';
    this.client = null;
    this.chainId = null;
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
        this.chainId = 1666700000;
        this.url = 'http://localhost:9500';
        break

      case 'testnet':
        this.chainId = 1666700000;
        this.url = "https://api.s0.b.hmny.io";
        break;
      
      case 'mainnet':
        this.chainId = 1666600000;
        this.url = "https://api.s0.t.hmny.io";
        break;
      
      case 'ropsten':
        this.chainId = 3,
        this.url = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`;
        break;

      case 'rinkeby':
        this.chainId = 4,
        this.url = `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`
        break;

      case 'kovan':
        this.chainId = 42,
        this.url = `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`
        break;
      
      default:
        console.log('Please enter a valid network');
        throw new Error('NetworkRequired');
    }

    this.setClient()

    this.privateKeys = {
      deployer: process.env[`${this.network.toUpperCase()}_PRIVATE_KEY`],
      tester: process.env[`${this.network.toUpperCase()}_TEST_ACCOUNT_PRIVATE_KEY`],
    }
  }

  setClient() {
    if (this.type == 'web3') {
      this.client = new Web3(this.url);
    } else {
      switch (this.network) {
        case 'ropsten':
        case 'rinkeby':
        case 'kovan':
          this.client = Ethers.getDefaultProvider(this.network, {infura: process.env.INFURA_KEY});
          break;
        
        default:
          this.client = new Ethers.providers.JsonRpcProvider(this.url, {chainId: this.chainId});
      }

      /*this.client.on('debug', (info) => {
        console.log(info.action);
        console.log(info.request);
        console.log(info.response);
        console.log(info.provider);
      });*/
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

    switch (this.type) {
      case 'web3':
        contract = this.loadWeb3Contract(contractJson, address, privateKey);
        break;
      case 'ethers':
        contract = this.loadEthersContract(contractJson, address, privateKey);
        break;

      default:
        contract = this.loadWeb3Contract(contractJson, address, privateKey);
    }

    return contract;
  }

  loadWeb3Contract(contractJson, address, privateKey) {
    var contract = new this.client.eth.Contract(contractJson.abi, address)

    if (privateKey != null && privateKey != '') {
      const account = this.client.eth.accounts.privateKeyToAccount(privateKey);
      this.client.eth.accounts.wallet.add(privateKey);
      this.client.eth.defaultAccount = account.address;
      this.wallet = account.address;
    }

    return contract
  }

  loadEthersContract(contractJson, address, privateKey) {
    var contract = new Ethers.Contract(address, contractJson.abi);

    if (privateKey != null && privateKey != '') {
      const wallet = new Ethers.Wallet(`0x${privateKey}`, this.client);
      this.wallet = wallet.address
      contract = contract.connect(wallet);
    }

    return contract
  }

  calculateGasMargin(value) {
    return value.mul(Ethers.BigNumber.from(10000).add(Ethers.BigNumber.from(1000))).div(Ethers.BigNumber.from(10000))
  }
}
