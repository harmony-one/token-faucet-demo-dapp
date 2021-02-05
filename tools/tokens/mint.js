// Args
const yargs = require('yargs')
const argv = yargs
  .option('network', {
    alias: 'n',
    description: 'Which network to mint tokens on',
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
    description: 'The token contract address',
    type: 'string'
  })
  .option('amount', {
    alias: 'm',
    description: 'The amount of tokens to mint',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv

const tokenAddress = argv.token
const api = argv.api

if (tokenAddress == null || tokenAddress == '') {
  console.log('You must supply a token contract address using --token CONTRACT_ADDRESS or -t CONTRACT_ADDRESS!')
  process.exit(0)
}

if (argv.amount == null || argv.amount == '') {
  console.log('You must supply the amount of tokens to mint using --amount AMOUNT or -a AMOUNT! Amount is a normal number - not wei')
  process.exit(0)
}

// Libs
const web3 = require('web3')
const Network = require("../network.js")

// Vars
const network = new Network(argv.network, api)
const amount = web3.utils.toWei(argv.amount)

const contract = network.loadContract('../build/contracts/TestToken.json', tokenAddress, 'deployer')

async function display() {
  var totalSupply

  totalSupply = (api == 'web3') ? await contract.methods.totalSupply().call() : await contract.totalSupply()
  totalSupply = (totalSupply._isBigNumber) ? totalSupply.toString() : totalSupply

  console.log(`Current total supply for the TestToken is: ${web3.utils.fromWei(totalSupply)}`)
}

async function mint() {
  var estimatedGas, tx, txHash
  
  if (api == 'web3') {
    estimatedGas = await contract.methods.mint(network.walletAddress, amount).estimateGas({from: network.walletAddress})
    tx = await contract.methods.mint(network.walletAddress, amount).send({from: network.walletAddress, gas: estimatedGas})
    txHash = tx.transactionHash
  } else if (api == 'ethers') {
    estimatedGas = await contract.estimateGas.mint(network.walletAddress, amount, {from: network.walletAddress})
    tx = await contract.mint(network.walletAddress, amount, {from: network.walletAddress, gasLimit: estimatedGas})
    txHash = tx.hash
    await tx.wait()
  }

  console.log(`Minted ${argv.amount} TestToken tokens, tx hash: ${txHash}`)
}

display().then(() => {
  mint().then(() => {
    display().then(() => {
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
