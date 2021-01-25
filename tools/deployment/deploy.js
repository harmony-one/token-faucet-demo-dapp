// Args
const yargs = require('yargs');
const argv = yargs
  .option('network', {
    alias: 'n',
    description: 'Which network to use',
    type: 'string',
    default: 'testnet'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Libs
const Network = require("../network.js");
const { getAddress } = require('@harmony-js/crypto');
const { isHex } = require('@harmony-js/utils');
const web3 = require('web3');

// Vars
const network = new Network(argv.network);
network.client.wallet.addByPrivateKey(network.privateKeys.deployer);

const faucet = {
  amount: web3.utils.toWei("10000"), //award 10000 tokens per faucet interaction
  frequency: 1 //will allow people to request funds every block (so essentially every ~5s)
}

async function deploy() {
  console.log('   Deploying contracts...\n');

  const tokenAddress = await deployContract('TestToken', []);
  console.log(`   Deployed TestToken contract to address ${tokenAddress} (${getAddress(tokenAddress).bech32})`);

  const faucetAddress = await deployContract('Faucet', [tokenAddress, faucet.amount, faucet.frequency]);
  console.log(`   Deployed Faucet contract to address ${faucetAddress} (${getAddress(faucetAddress).bech32})\n`);

  console.log(`   export NETWORK=${argv.network}; export TOKEN=${tokenAddress}; export FAUCET=${faucetAddress}\n`);
}

async function deployContract(contractName, args) {
  let contractJson = require(`../../build/contracts/${contractName}`);
  let contract = network.client.contracts.createContract(contractJson.abi);
  contract.wallet.addByPrivateKey(network.privateKeys.deployer);
  let contractData = isHex(contractJson.bytecode) ? contractJson.bytecode : `0x${contractJson.bytecode}`;

  let options = {
    arguments: args,
    data: contractData
  };

  let response = await contract.methods.contractConstructor(options).send(network.gasOptions());
  //console.log(response.transaction.receipt.transactionHash);
  const contractAddress = response.transaction.receipt.contractAddress;
  return contractAddress;
}

deploy()
  .then(() => {
    process.exit(0);
  })
  .catch(function(err){
    console.log(err);
    process.exit(0);
  });
