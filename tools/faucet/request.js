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
  .option('privateKey', {
    alias: 'p',
    description: 'What private key to use',
    type: 'string',
    default: 'tester'
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

// Libs
const web3 = require('web3');
const Network = require("../network.js");
const { getAddress } = require("@harmony-js/crypto");

// Vars
const network = new Network(argv.network);

const tokenContract = network.loadContract(`../build/contracts/TestToken.json`, tokenAddress, argv.privateKey);
const tokenInstance = tokenContract.methods;

const faucetContract = network.loadContract(`../build/contracts/Faucet.json`, faucetAddress, argv.privateKey);
const faucetInstance = faucetContract.methods;

const walletAddress = tokenContract.wallet.signer.address;
const walletAddressBech32 = getAddress(walletAddress).bech32;

async function status() {
  let balanceOf = await tokenInstance.balanceOf(walletAddress).call(network.gasOptions());
  console.log(`TestToken (${tokenAddress}) balance for address ${walletAddress} / ${walletAddressBech32} is: ${web3.utils.fromWei(balanceOf)}\n`);

  let balance = await faucetInstance.balance().call(network.gasOptions());
  console.log(`The current balance of TestToken (${tokenAddress}) tokens in the faucet is: ${web3.utils.fromWei(balance)}`);
}

async function fund() {
  console.log(`Attempting to fund the address ${walletAddress} / ${walletAddressBech32} with TestToken tokens from the faucet (${faucetAddress}) ...`)
  let tx = await faucetInstance.fund(walletAddress).send(network.gasOptions());
  let txHash = tx.transaction.receipt.transactionHash;
  console.log(`Faucet funding tx hash: ${txHash}\n`);
}

status()
  .then(() => {
    fund().then(() => {
      status().then(() => {
        process.exit(0);
      })
    })
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });
