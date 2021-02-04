require("@nomiclabs/hardhat-waffle")
require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    hardhat: {},

    // Harmony
    harmony_localnet: {
      url: 'http://localhost:9500',
      chainId: 1666700000,
      gasPrice: parseInt(process.env.HARMONY_GAS_PRICE),
      accounts: [process.env.HARMONY_LOCALNET_PRIVATE_KEY],
    },
    harmony_testnet: {
      url: 'https://api.s0.b.hmny.io',
      chainId: 1666700000,
      gasPrice: parseInt(process.env.HARMONY_GAS_PRICE),
      accounts: [process.env.HARMONY_TESTNET_PRIVATE_KEY],
    },
    harmony_mainnet: {
      url: 'https://api.s0.t.hmny.io',
      chainId: 1666600000,
      gasPrice: parseInt(process.env.HARMONY_GAS_PRICE),
      accounts: [process.env.HARMONY_MAINNET_PRIVATE_KEY],
    },

    // Ethereum
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.ROPSTEN_PRIVATE_KEY],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.RINKEBY_PRIVATE_KEY],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.KOVAN_PRIVATE_KEY],
    },
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
}
