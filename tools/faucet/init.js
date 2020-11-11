// Args
const yargs = require('yargs');
const argv = yargs
  .option('network', {
    alias: 'n',
    description: 'Which network to use',
    type: 'string',
    default: 'testnet'
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
    alias: 'a',
    description: 'The amount of tokens to send to the faucet',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

const tokenAddress = argv.token;
const faucetAddress = argv.faucet;

if (tokenAddress == null || tokenAddress == '') {
  console.log('You must supply a token contract address using --token CONTRACT_ADDRESS or -t CONTRACT_ADDRESS!');
  process.exit(0);
}

if (faucetAddress == null || faucetAddress == '') {
  console.log('You must supply the faucet contract address using --faucet CONTRACT_ADDRESS or -f CONTRACT_ADDRESS!');
  process.exit(0);
}

if (argv.amount == null || argv.amount == '') {
  console.log('You must supply the amount of tokens to mint using --amount AMOUNT or -a AMOUNT! Amount is a normal number - not wei');
  process.exit(0);
}

// Libs
const web3 = require('web3');
const Network = require("../network.js");
const { getAddress } = require("@harmony-js/crypto");

// Vars
const network = new Network(argv.network);
const amount = web3.utils.toWei(argv.amount);

const tokenContract = network.loadContract(`../build/contracts/TestToken.json`, tokenAddress, 'deployer');
const tokenInstance = tokenContract.methods;

const faucetContract = network.loadContract(`../build/contracts/Faucet.json`, faucetAddress, 'deployer');
const faucetInstance = faucetContract.methods;

const walletAddress = tokenContract.wallet.signer.address;
const walletAddressBech32 = getAddress(walletAddress).bech32;

async function status() {
  let balanceOf = await tokenInstance.balanceOf(walletAddress).call(network.gasOptions());
  console.log(`TestToken (${tokenAddress}) balance for address ${walletAddress} / ${walletAddressBech32} is: ${web3.utils.fromWei(balanceOf)}\n`);

  let balance = await faucetInstance.balance().call(network.gasOptions());
  console.log(`The current balance of TestToken (${tokenAddress}) tokens in the faucet is: ${web3.utils.fromWei(balance)}`);
}

async function topup() {
  console.log(`Attempting to topup the TestToken faucet (${faucetAddress}) with ${argv.amount} tokens...`)
  let tx = await tokenInstance.transfer(faucetAddress, amount).send(network.gasOptions());
  let txHash = tx.transaction.receipt.transactionHash;
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
