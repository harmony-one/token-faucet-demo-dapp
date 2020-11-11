const TestToken = artifacts.require("TestToken");
const Faucet = artifacts.require("Faucet");

const { getAddress } = require("@harmony-js/crypto");
const web3 = require('web3');
const faucet = {
  amount: web3.utils.toWei("10000"), //award 10000 tokens per faucet interaction
  frequency: 1 //will allow people to request funds every block (so essentially every ~5s)
}

module.exports = function (deployer, network, accounts) {
  deployer.deploy(TestToken).then(function () {
    return deployer.deploy(Faucet, TestToken.address, faucet.amount, faucet.frequency).then(function () {
      console.log(`   TestToken address: ${TestToken.address} - ${getAddress(TestToken.address).bech32}`);
      console.log(`   Faucet address: ${Faucet.address} - ${getAddress(Faucet.address).bech32}\n`);
      console.log(`   export NETWORK=${network}; export TOKEN=${TestToken.address}; export FAUCET=${Faucet.address}\n`);
    }); // End Faucet deployment
  }); // End TestToken deployment
}
