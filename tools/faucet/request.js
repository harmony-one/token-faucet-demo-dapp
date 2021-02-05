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
  .option('token', {
    alias: 't',
    description: 'The contract address for the token you want to interact with (in our case: TestToken)',
    type: 'string'
  })
  .option('faucet', {
    alias: 'f',
    description: 'The faucet contract address',
    type: 'string'
  })
  .option('privateKey', {
    alias: 'p',
    description: 'What private key to use',
    type: 'string',
    default: 'tester'
  })
  .help()
  .alias('help', 'h')
  .argv

const tokenAddress = argv.token
const faucetAddress = argv.faucet
const api = argv.api

if (tokenAddress == null || tokenAddress == '') {
  console.log('You must supply a token contract address using --token CONTRACT_ADDRESS or -t CONTRACT_ADDRESS!')
  process.exit(0)
}

if (faucetAddress == null || faucetAddress == '') {
  console.log('You must supply the faucet contract address using --faucet CONTRACT_ADDRESS or -f CONTRACT_ADDRESS!')
  process.exit(0)
}

// Libs
const Web3 = require('web3')
const Network = require("../network.js")
const { getAddress } = require("@harmony-js/crypto")

// Vars
const network = new Network(argv.network, api)

const tokenContract = network.loadContract(`../build/contracts/TestToken.json`, tokenAddress, argv.privateKey)
const faucetContract = network.loadContract(`../build/contracts/Faucet.json`, faucetAddress, argv.privateKey)

async function status() {
  var balanceOf, balance

  balanceOf = (api == 'web3') ? await tokenContract.methods.balanceOf(network.walletAddress).call() : await tokenContract.balanceOf(network.walletAddress)
  balanceOf = (balanceOf._isBigNumber) ? balanceOf.toString() : balanceOf
  console.log(`TestToken (${tokenAddress}) balance for address ${network.walletAddress} / ${getAddress(network.walletAddress).bech32} is: ${Web3.utils.fromWei(balanceOf)}\n`)

  balance = (api == 'web3') ? await faucetContract.methods.balance().call() : await faucetContract.balance()
  balance = (balance._isBigNumber) ? balance.toString() : balance
  console.log(`The current balance of TestToken (${tokenAddress}) tokens in the faucet is: ${Web3.utils.fromWei(balance)}`);
}

async function fund() {
  console.log(`Attempting to fund the address ${network.walletAddress} / ${getAddress(network.walletAddress).bech32} with TestToken tokens from the faucet (${faucetAddress}) ...`)

  var estimatedGas, tx, txHash
  
  if (api == 'web3') {
    estimatedGas = await faucetContract.methods.fund(network.walletAddress).estimateGas({from: network.walletAddress})
    tx = await faucetContract.methods.fund(network.walletAddress).send({from: network.walletAddress, gas: estimatedGas})
    txHash = tx.transactionHash
  } else if (api == 'ethers') {
    estimatedGas = await faucetContract.estimateGas.fund(network.walletAddress, {from: network.walletAddress})
    tx = await faucetContract.fund(network.walletAddress, {from: network.walletAddress, gasLimit: estimatedGas})
    txHash = tx.hash
    await tx.wait()
  }

  console.log(`Faucet topup tx hash: ${txHash}\n`)
}

status().then(() => {
  fund().then(() => {
    status().then(() => {
      process.exit(0)
    })
    .catch(function(err){
      console.log(err)
      process.exit(0)
    })
  })
  .catch(function(err){
    console.log(err)
    process.exit(0)
  })
})
.catch(function(err){
  console.log(err)
  process.exit(0)
})
