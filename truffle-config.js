require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider")
const { TruffleProvider } = require('@harmony-js/core')
const PrivateKeyProvider = require('./private-provider')

/*
TODO: fix Truffle deployments using @truffle/hdwallet-provider
Somehow the network_id/chain_id is omitted when signing txs using Harmony's ETH compatible chain ids.

This seems to be an issue for some other chains that also use custom chain ids - https://medium.com/moonbeam-network/moonbeam-truffle-box-a-boilerplate-setup-to-get-started-deploying-smart-contracts-on-moonbeam-5f911fa584de:

"If you are familiar with Truffle, you might have noticed that we are using a custom provider programmed by ourselves, instead of the most common ones such as hdwallet-provider.
This custom provider still uses standard libraries such as the web3-provider-engine and ethereumjs-wallet.
The reason behind this is because our custom chain ID was not being included by the library used to sign the transactions.
Therefore, the signature is invalid because the chain ID in the transaction blob is missing, and the transaction is rejected."

Weirdly enough, since Feb 15, 2021 Moonbeam now seems to be able to use regular @truffle/hdwallet-provider and have ditched their previous PrivateKeyProvider solution.
But @truffle/hdwallet-provider still won't work on Harmony, despite using all of the latest versions of Truffle + @truffle/hdwallet-provider
*/

module.exports = {
  networks: {
    
    // Harmony - using PrivateKeyProvider
    harmony_localnet: {
      provider: () => {
        return new PrivateKeyProvider(process.env.HARMONY_LOCALNET_PRIVATE_KEY, process.env.HARMONY_LOCALNET_URL, 1666700000)
      },
      network_id: 1666700000
    },

    harmony_testnet: {
      provider: () => {
        return new PrivateKeyProvider(process.env.HARMONY_TESTNET_PRIVATE_KEY, process.env.HARMONY_TESTNET_URL, 1666700000)
      },
      network_id: 1666700000
    },

    harmony_mainnet: {
      provider: () => {
        return new PrivateKeyProvider(process.env.HARMONY_MAINNET_PRIVATE_KEY, process.env.HARMONY_MAINNET_URL, 1666600000)
      },
      network_id: 1666600000
    },

    // Harmony - using @harmony-js/core
    harmony_js_localnet: {
      provider: () => {
        const truffleProvider = new TruffleProvider(
          process.env.HARMONY_LOCALNET_URL,
          { },
          { shardID: 0, chainId: 2 },
          { gasLimit: process.env.HARMONY_GAS_LIMIT, gasPrice: process.env.HARMONY_GAS_PRICE},
        );
        const newAcc = truffleProvider.addByPrivateKey(process.env.HARMONY_LOCALNET_PRIVATE_KEY);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
      network_id: 2,
    },

    harmony_js_testnet: {
      provider: () => {
        const truffleProvider = new TruffleProvider(
          process.env.HARMONY_TESTNET_URL,
          { },
          { shardID: 0, chainId: 2 },
          { gasLimit: process.env.HARMONY_GAS_LIMIT, gasPrice: process.env.HARMONY_GAS_PRICE},
        );
        const newAcc = truffleProvider.addByPrivateKey(process.env.HARMONY_TESTNET_PRIVATE_KEY);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
      network_id: 2,
    },

    harmony_js_mainnet: {
      provider: () => {
        const truffleProvider = new TruffleProvider(
          process.env.MAINNET_URL,
          { },
          { shardID: 0, chainId: 1 },
          { gasLimit: process.env.HARMONY_GAS_LIMIT, gasPrice: process.env.HARMONY_GAS_PRICE },
        );
        const newAcc = truffleProvider.addByPrivateKey(process.env.HARMONY_MAINNET_PRIVATE_KEY);
        truffleProvider.setSigner(newAcc);
        return truffleProvider;
      },
      network_id: 1,
    },

    // Ethereum
    ethereum_ropsten: {
      provider: () => {
        return new HDWalletProvider(process.env.ROPSTEN_PRIVATE_KEY, `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 3,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    ethereum_rinkeby: {
      provider: () => {
        return new HDWalletProvider(process.env.RINKEBY_PRIVATE_KEY, `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 4,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    ethereum_kovan: {
      provider: () => {
        return new HDWalletProvider(process.env.KOVAN_PRIVATE_KEY, `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 42,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    ethereum_mainnet: {
      provider: () => {
        return new HDWalletProvider(process.env.MAINNET_PRIVATE_KEY, `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 1,
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
      version: "0.7.6",    // Fetch exact version from solc-bin (default: truffle's version)
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
