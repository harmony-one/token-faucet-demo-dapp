'use strict'

const Web3 = require('web3')
const Ethers = require('ethers')
require("dotenv").config()

module.exports = class Network {
  constructor(network, type, debug) {
    this.type = ''

    if (type) {
      this.type = type
    } else {
      this.type = 'web3'
    }

    this.network = ''
    this.url = ''
    
    this.client = null
    this.chainId = null
    
    this.privateKeys = {deployer: null, tester: null}
    this.wallet = null
    this.walletAddress = ''

    this.debug = debug || false
    
    this.setNetwork(network)
    this.gasPrice = process.env.HARMONY_GAS_PRICE
    this.gasLimit = process.env.HARMONY_GAS_LIMIT
  }

  setNetwork(network) {
    this.network = network.toLowerCase()
    
    switch (this.network) {
      case 'harmony_localnet':
      case 'harmony_local':
        this.network = 'harmony_localnet'
        this.chainId = 1666700000
        this.url = 'http://localhost:9500'
        break

      case 'harmony_testnet':
        this.chainId = 1666700000
        this.url = "https://api.s0.b.hmny.io"
        break
      
      case 'harmony_mainnet':
        this.chainId = 1666600000
        this.url = "https://api.s0.t.hmny.io"
        break
      
      case 'ropsten':
        this.chainId = 3,
        this.url = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`
        break

      case 'rinkeby':
        this.chainId = 4,
        this.url = `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`
        break

      case 'kovan':
        this.chainId = 42,
        this.url = `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`
        break
      
      default:
        console.log('Please enter a valid network')
        throw new Error('NetworkRequired')
    }

    this.setClient()

    this.privateKeys = {
      deployer: process.env[`${this.network.toUpperCase()}_PRIVATE_KEY`],
      tester: process.env[`${this.network.toUpperCase()}_TEST_ACCOUNT_PRIVATE_KEY`],
    }
  }

  setClient() {
    if (this.type == 'web3') {
      this.setWeb3Client()
    } else {
      this.setEthersClient()
    }
  }

  setWeb3Client() {
    this.client = new Web3(this.url)
  }

  setEthersClient() {
    switch (this.network) {
      case 'ropsten':
      case 'rinkeby':
      case 'kovan':
        this.client = Ethers.getDefaultProvider(this.network, {infura: process.env.INFURA_KEY})
        break
      
      default:
        this.client = new Ethers.providers.JsonRpcProvider(this.url, {chainId: this.chainId})
    }

    if (this.debug) {
      this.client.on('debug', (info) => {
        console.log(info.action)
        console.log(info.request)
        console.log(info.response)
        console.log(info.provider)
      })
    }
  }

  privateKeyFromPrivateKeyType(privateKeyType) {
    let privateKey = null

    switch (privateKeyType) {
      case 'deployer':
      case 'tester':
        privateKey = this.privateKeys[privateKeyType]
        break

      default:
        privateKey = privateKeyType
    }

    return privateKey
  }

  setDefaultWallet(privateKeyType) {
    const privateKey = this.privateKeyFromPrivateKeyType(privateKeyType)

    switch (this.type) {
      case 'web3':
        this.setDefaultWeb3Wallet(privateKey)
        break
      case 'ethers':
        this.setDefaultEthersWallet(privateKey)
        break

      default:
        this.setDefaultWeb3Wallet(privateKey)
    }
  }

  setDefaultWeb3Wallet(privateKey) {
    if (privateKey != null && privateKey != '') {
      const account = this.client.eth.accounts.privateKeyToAccount(privateKey)
      this.client.eth.accounts.wallet.add(privateKey)
      this.client.eth.defaultAccount = this.walletAddress = account.address
    }
  }

  setDefaultEthersWallet(privateKey) {
    if (privateKey != null && privateKey != '') {
      this.wallet = new Ethers.Wallet(`0x${privateKey}`, this.client)
      this.walletAddress = this.wallet.address
    }
  }

  loadContract(path, address, privateKeyType) {
    const privateKey = this.privateKeyFromPrivateKeyType(privateKeyType)
    let contract = null
    const contractJson = require(path)

    switch (this.type) {
      case 'web3':
        contract = this.loadWeb3Contract(contractJson, address, privateKey)
        break
      case 'ethers':
        contract = this.loadEthersContract(contractJson, address, privateKey)
        break

      default:
        contract = this.loadWeb3Contract(contractJson, address, privateKey)
    }

    return contract
  }

  loadWeb3Contract(contractJson, address, privateKey) {
    this.setDefaultWeb3Wallet(privateKey)
    return new this.client.eth.Contract(contractJson.abi, address)
  }

  loadEthersContract(contractJson, address, privateKey) {
    var contract = new Ethers.Contract(address, contractJson.abi)

    if (privateKey != null && privateKey != '') {
      this.setDefaultEthersWallet(privateKey)
      contract = contract.connect(this.wallet)
    }

    return contract
  }

  newContract(path, privateKeyType) {
    const privateKey = this.privateKeyFromPrivateKeyType(privateKeyType)
    let contract = null
    const contractJson = require(path)

    switch (this.type) {
      case 'web3':
        contract = this.newWeb3Contract(contractJson, privateKey)
        break
      case 'ethers':
        contract = this.newEthersContract(contractJson, privateKey)
        break

      default:
        contract = this.newWeb3Contract(contractJson, privateKey)
    }

    return contract
  }

  newWeb3Contract(contractJson, privateKey) {
    this.setDefaultWeb3Wallet(privateKey)
    var bytecode = Web3.utils.isHex(contractJson.bytecode) ? contractJson.bytecode : `0x${contractJson.bytecode}`
    var contract = new this.client.eth.Contract(contractJson.abi, null, { data: bytecode })

    return contract
  }

  newEthersContract(contractJson, privateKey) {
    var bytecode = Web3.utils.isHex(contractJson.bytecode) ? contractJson.bytecode : `0x${contractJson.bytecode}`
    var contract = new Ethers.ContractFactory(contractJson.abi, bytecode)

    if (privateKey != null && privateKey != '') {
      this.setDefaultEthersWallet(privateKey)
      contract = contract.connect(this.wallet)
    }

    return contract
  }

  calculateGasMargin(value) {
    return value.mul(Ethers.BigNumber.from(10000).add(Ethers.BigNumber.from(1000))).div(Ethers.BigNumber.from(10000))
  }
}
