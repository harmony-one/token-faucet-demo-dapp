// Args
const yargs = require('yargs');
const argv = yargs
  .option('network', {
    alias: 'n',
    description: 'Which network to mint tokens on',
    type: 'string',
    default: 'testnet'
  })
  .option('token', {
    alias: 't',
    description: 'The token contract address',
    type: 'string'
  })
  .option('amount', {
    alias: 'a',
    description: 'The amount of tokens to mint',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

const tokenAddress = argv.token;

if (tokenAddress == null || tokenAddress == '') {
  console.log('You must supply a token contract address using --token CONTRACT_ADDRESS or -t CONTRACT_ADDRESS!');
  process.exit(0);
}

if (argv.amount == null || argv.amount == '') {
  console.log('You must supply the amount of tokens to mint using --amount AMOUNT or -a AMOUNT! Amount is a normal number - not wei');
  process.exit(0);
}

// Libs
const web3 = require('web3');
const Network = require("../network.js");

// Vars
const network = new Network(argv.network);
const amount = web3.utils.toWei(argv.amount);

const contract = network.loadContract('../build/contracts/TestToken.json', tokenAddress, 'deployer');
const instance = contract.methods;
const ownerAddress = contract.wallet.signer.address;

async function display() {
  let total = await instance.totalSupply().call(network.gasOptions());
  let formattedTotal = web3.utils.fromWei(total);
  console.log(`Current total supply for the TestToken is: ${formattedTotal}`);
}

async function mint() {
  let result = await instance.mint(ownerAddress, amount).send(network.gasOptions());
  let txHash = result.transaction.receipt.transactionHash;
  console.log(`Minted ${argv.amount} TestToken tokens, tx hash: ${txHash}`);
}

display()
  .then(() => {
    mint()
      .then(() => {
        display().then(() => {
          process.exit(0);
        })
    })
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });
