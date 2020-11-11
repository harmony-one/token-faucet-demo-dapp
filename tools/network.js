'use strict';

const web3 = require('web3');
require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");

module.exports = class Network {
  constructor(network) {
    this.client = null;
    this.privateKeys = {deployer: null, tester: null};
    this.setNetwork(network);
    this.gasPrice = process.env.GAS_PRICE;
    this.gasLimit = process.env.GAS_LIMIT;
  }

  setNetwork(network) {
    this.network = network.toLowerCase();
    var url, chainType, chainId;

    switch (this.network) {
      case 'localnet':
      case 'local':
        this.network = 'localnet';
        this.url = 'http://localhost:9500';
        this.explorerUrl = '';
        this.chainType = ChainType.Harmony;
        this.chainId = ChainID.HmyLocal;
        break

      case 'testnet':
        url = "https://api.s0.b.hmny.io";
        chainType = ChainType.Harmony;
        chainId = ChainID.HmyTestnet;
        break;
      
      case 'mainnet':
        url = "https://api.s0.t.hmny.io";
        chainType = ChainType.Harmony;
        chainId = ChainID.HmyMainnet;
        break;
      
      default:
        console.log('Please enter a valid network - testnet or mainnet.');
        throw new Error('NetworkRequired');
    }

    this.client = new Harmony(
      url,
      {
        chainType: chainType,
        chainId: chainId,
      }
    );

    this.privateKeys = {
      deployer: process.env[`${this.network.toUpperCase()}_PRIVATE_KEY`],
      tester: process.env[`${this.network.toUpperCase()}_TEST_ACCOUNT_PRIVATE_KEY`],
    }
  }

  gasOptions() {
    return {
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
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
    contract = this.client.contracts.createContract(contractJson.abi, address);

    if (privateKey != null && privateKey != '') {
      contract.wallet.addByPrivateKey(privateKey);
    }

    return contract;
  }
};
