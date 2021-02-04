// Args
const yargs = require('yargs')
const argv = yargs
  .option('network', {
    alias: 'n',
    description: 'Which network to use',
    type: 'string',
    default: 'harmony_testnet'
  })
  .option('api', {
    alias: 'a',
    description: 'Which api to use (web3 or ethers)',
    type: 'string',
    default: 'web3'
  })
  .help()
  .alias('help', 'h')
  .argv

const api = argv.api

// Libs
const Web3 = require('web3')
const Network = require("../network.js")
const { getAddress } = require('@harmony-js/crypto')

// Vars
const network = new Network(argv.network, api)

async function deploy() {
  console.log(`Attempting to deploy the TestToken contract using ${api}`)
  const tokenContract = network.newContract(`../build/contracts/TestToken.json`, 'deployer')
  const tokenContractAddress = await deployContract(tokenContract, [])

  console.log(`Attempting to deploy the Faucet contract using ${api}`)
  const faucetOptions = {
    amount: Web3.utils.toWei("10000"), //award 10000 tokens per faucet interaction
    frequency: 1 //will allow people to request funds every block (so essentially every ~2s)
  }
  const faucetArgs = [tokenContractAddress, faucetOptions.amount, faucetOptions.frequency]
  const faucetContract = network.newContract(`../build/contracts/Faucet.json`, 'deployer')
  const faucetContractAddress = await deployContract(faucetContract, faucetArgs)

  console.log(`   TestToken address: ${tokenContractAddress} - ${getAddress(tokenContractAddress).bech32}`)
  console.log(`   Faucet address: ${faucetContractAddress} - ${getAddress(faucetContractAddress).bech32}\n`)
  console.log(`   export NETWORK=${argv.network}; export TOKEN=${tokenContractAddress}; export FAUCET=${faucetContractAddress}\n`)
}

async function deployContract(contract, args) {
  var estimatedGas, contractAddress, instance

  if (api == 'web3') {
    estimatedGas = await contract.deploy({arguments: args}).estimateGas({from: network.walletAddress})
    instance = await contract.deploy({arguments: args}).send({from: network.walletAddress, gas: estimatedGas})
    contractAddress = instance.options.address
  } else if (api == 'ethers') {
    instance = await contract.deploy(...args)
    contractAddress = instance.address
    await instance.deployTransaction.wait()
  }

  return contractAddress
}

deploy()
  .then(() => {
    process.exit(0)
  })
  .catch(function(err){
    console.log(err)
    process.exit(0)
  })
