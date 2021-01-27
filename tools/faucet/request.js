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
const faucetContract = network.loadContract(`../build/contracts/Faucet.json`, faucetAddress, argv.privateKey);

const walletAddress = network.wallet;
const walletAddressBech32 = getAddress(walletAddress).bech32;

async function status() {
  let balanceOf = await tokenContract.methods.balanceOf(walletAddress).call();
  console.log(`TestToken (${tokenAddress}) balance for address ${walletAddress} / ${walletAddressBech32} is: ${web3.utils.fromWei(balanceOf)}\n`);

  let balance = await faucetContract.methods.balance().call();
  console.log(`The current balance of TestToken (${tokenAddress}) tokens in the faucet is: ${web3.utils.fromWei(balance)}`);
}

async function fund() {
  console.log(`Attempting to fund the address ${walletAddress} / ${walletAddressBech32} with TestToken tokens from the faucet (${faucetAddress}) ...`)

  var estimatedGas = await faucetContract.methods.fund(walletAddress).estimateGas({from: walletAddress});
  console.log({estimatedGas});
  estimatedGas = (estimatedGas < 55000) ? 55000 : estimatedGas
  const tx = await faucetContract.methods.fund(walletAddress).send({from: walletAddress, gas: estimatedGas}); // Estimated gas doesn't work for this contract call - need to adjust it
  
  console.log(`Faucet topup tx hash: ${tx.transactionHash}\n`);
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
