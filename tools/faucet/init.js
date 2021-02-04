// Args
const yargs = require('yargs');
const argv = yargs
  .option('network', {
    alias: 'n',
    description: 'Which network to use',
    type: 'string',
    default: 'testnet'
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
  .option('amount', {
    alias: 'm',
    description: 'The amount of tokens to send to the faucet',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

const tokenAddress = argv.token;
const faucetAddress = argv.faucet;
const api = argv.api;

if (tokenAddress == null || tokenAddress == '') {
  console.log('You must supply a token contract address using --token CONTRACT_ADDRESS or -t CONTRACT_ADDRESS!');
  process.exit(0);
}

if (faucetAddress == null || faucetAddress == '') {
  console.log('You must supply the faucet contract address using --faucet CONTRACT_ADDRESS or -f CONTRACT_ADDRESS!');
  process.exit(0);
}

if (argv.amount == null || argv.amount == '') {
  console.log('You must supply the amount of tokens to transfer to the faucet using --amount AMOUNT or -a AMOUNT! Amount is a normal number - not wei');
  process.exit(0);
}

// Libs
const Web3 = require('web3');
const Network = require("../network.js");
const { getAddress } = require("@harmony-js/crypto");

// Vars
const network = new Network(argv.network, api);
const amount = Web3.utils.toWei(argv.amount);

const tokenContract = network.loadContract(`../build/contracts/TestToken.json`, tokenAddress, 'deployer');
const faucetContract = network.loadContract(`../build/contracts/Faucet.json`, faucetAddress, 'deployer');

var walletAddress = network.walletAddress;
const walletAddressBech32 = getAddress(walletAddress).bech32;

async function status() {
  var balanceOf, balance;

  balanceOf = (api == 'web3') ? await tokenContract.methods.balanceOf(walletAddress).call() : await tokenContract.balanceOf(walletAddress)
  balanceOf = (balanceOf._isBigNumber) ? balanceOf.toString() : balanceOf
  console.log(`TestToken (${tokenAddress}) balance for address ${walletAddress} / ${walletAddressBech32} is: ${Web3.utils.fromWei(balanceOf)}\n`);

  balance = (api == 'web3') ? await faucetContract.methods.balance().call() : await faucetContract.balance()
  balance = (balance._isBigNumber) ? balance.toString() : balance
  console.log(`The current balance of TestToken (${tokenAddress}) tokens in the faucet is: ${Web3.utils.fromWei(balance)}`);
}

async function topup() {
  console.log(`Attempting to topup the TestToken faucet (${faucetAddress}) with ${argv.amount} tokens...`)

  var estimatedGas, tx, txHash;
  
  if (api == 'web3') {
    estimatedGas = await tokenContract.methods.transfer(faucetAddress, amount).estimateGas({from: walletAddress})
    tx = await tokenContract.methods.transfer(faucetAddress, amount).send({from: walletAddress, gas: estimatedGas})
    txHash = tx.transactionHash
  } else if (api == 'ethers') {
    estimatedGas = await tokenContract.estimateGas.transfer(faucetAddress, amount, {from: walletAddress})
    tx = await tokenContract.transfer(faucetAddress, amount, {from: walletAddress, gasLimit: estimatedGas})
    txHash = tx.hash
    await tx.wait()
  }

  console.log(`Faucet topup tx hash: ${txHash}\n`);
}

status()
  .then(() => {
    topup().then(() => {
      status().then(() => {
        process.exit(0);
      })
    })
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });
