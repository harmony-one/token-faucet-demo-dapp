require('dotenv').config()
const { TruffleProvider } = require('@harmony-js/core')
const HDWalletProvider = require("@truffle/hdwallet-provider")

module.exports = {
  networks: {
    // Harmony
    harmony_localnet: {
      network_id: '2',
      provider: () => {
        const truffleProvider = new TruffleProvider(
          process.env.LOCALNET_URL,
          { },
          { shardID: 0, chainId: 2 },
          { gasLimit: process.env.GAS_LIMIT, gasPrice: process.env.GAS_PRICE},
        );
        const newAcc = truffleProvider.addByPrivateKey(process.env.LOCALNET_PRIVATE_KEY);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
    },
    harmony_testnet: {
      network_id: '2',
      provider: () => {
        const truffleProvider = new TruffleProvider(
          process.env.TESTNET_URL,
          { },
          { shardID: 0, chainId: 2 },
          { gasLimit: process.env.GAS_LIMIT, gasPrice: process.env.GAS_PRICE},
        );
        const newAcc = truffleProvider.addByPrivateKey(process.env.TESTNET_PRIVATE_KEY);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
    },
    harmony_mainnet: {
      network_id: '1',
      provider: () => {
        const truffleProvider = new TruffleProvider(
          process.env.MAINNET_URL,
          { },
          { shardID: 0, chainId: 1 },
          { gasLimit: process.env.GAS_LIMIT, gasPrice: process.env.GAS_PRICE },
        );
        const newAcc = truffleProvider.addByPrivateKey(process.env.MAINNET_PRIVATE_KEY);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
    },

    // Ethereum
    ropsten: {
      provider: function() {
        return new HDWalletProvider(process.env.ROPSTEN_PRIVATE_KEY, `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 3,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(process.env.RINKEBY_PRIVATE_KEY, `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 4,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(process.env.KOVAN_PRIVATE_KEY, `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 42,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.12",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
  },
};
