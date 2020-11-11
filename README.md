# Token Faucet Demo dApp on Harmony

This repo contains a simple ERC-20 faucet dApp that will distribute a ERC-20 token called TestToken to whomever interacts with the dApp.

The intention of this dApp is to showcase how to build a simple dApp on Harmony.

## Smart contracts & deployment

This repo contains two implementation contracts: `TestToken.sol` and `Faucet.sol`.

Solidity 0.6.12 is used as the compiler for these contracts, primarily due to `@openzeppelin`'s dependency on `pragma solidity ^0.6.0;`.

Deployment of these contracts can be done using either Truffle or @harmony-js/core (more on this later).

### Smart contracts

#### TestToken.sol

`TestToken.sol` is a simple ERC-20 token that is implemented using `@openzeppelin`'s smart contract suite. The token contract will automatically mint 100,000,000 tokens when deployed.

#### Faucet.sol

`Faucet.sol` is the actual faucet contract. It's a configurable contract that can be deployed for any ERC-20 token and the amount as well as the frequency for requesting funds from the faucet can be configured.

### Smart contract deployment

As previously mentioned smart contracts can be deployed using Truffle or @harmony-js/core. If you're used to Truffle deployments you can continue to use that for deploying smart contracts on Harmony as well.

@harmony-js/core can be used to perform more advanced and custom deployments.

This repository contains examples for deploying contracts using both methods. Harmony also has a fork of the Remix IDE which is available [here](https://peekpi.github.io/remixide/).

#### Credentials & private keys

Both deployment methods in this repository depend on a `.env` file being populated with a correct private key for a deployer wallet on each respective network. If you intend to use the same deployer wallet for all networks (localnet, testnet & mainnet), you can use the same private key for all these three separate networks.

A [.env-example](.env-example) file is included in this repository by default, copy it to `.env` and add the private keys you intend to use to perform smart contract deployments on Harmony.

#### Truffle

In order to deploy the smart contracts you need to add a custom provider in [truffle-config.js](truffle-config.js):

```
require('dotenv').config()
const { TruffleProvider } = require('@harmony-js/core')

module.exports = {
  networks: {
    testnet: {
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
    mainnet: {
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
    }
  },

  ...
};
```

The above will configure Truffle to deploy smart contracts to Harmony's testnet and mainnet.

You can now go ahead and deploy these contracts to Harmony:
```
truffle compile
truffle migrate --network testnet --reset --skip-dry-run
```

#### Waffle

This repository has also been configured to support smart contract compilation using [Waffle](https://getwaffle.io)

You can compile the smart contracts using Waffle optimizations by running the command `yarn compile`. `yarn compile` will also run a separate [ABI extractor script](scripts/abi.sh) in a `postcompile` step that will be exported to `build/abi`.

#### @harmony-js/core

[@harmony-js/core](https://www.npmjs.com/package/@harmony-js/core) is Harmony's own [JavaScript/TypeScript SDK](https://github.com/harmony-one/sdk).

It can be used for both smart contract deployment as well as smart contract interactions (which we'll look into a bit more later).

In order to deploy smart contracts using @harmony-js/core you need to implement your own custom deployment tool. You'll find an example of such a tool in [tools/deployment/deploy.js](tools/deployment/deploy.js).

To deploy smart contracts using this tool you'd do the following:
```
yarn compile
node tools/deployment/deploy.js --network testnet
```

This tool will output something similar to the following:
```
$ node tools/deployment/deploy.js --network testnet
    Deployed TestToken contract to address 0xd801333222bffa78df2663f91f76a91dc0dea408 (one1mqqnxv3zhla83hexv0u37a4frhqdafqg6c92ty)
    Deployed Faucet contract to address 0xbca23ecd4de7067e715119bd274904fea2e53526 (one1hj3ran2duur8uu23rx7jwjgyl63w2dfxz6hp4m)
```

### CLI tooling

To interact with the smart contracts in this repository there are also three separate CLI tools:

- [tools/faucet/init.js](tools/faucet/init.js): This tool initializes the faucet and transfers tokens to it so that dApp users can request funds from it. This step is **mandatory**, otherwise users can't request funds from the faucet.
- [tools/faucet/request.js](tools/faucet/request.js): This tool requests funds from the faucet for a given user.
- [tools/tokens/mint.js](tools/tokens/mint.js): This tool mints new `TestToken` tokens.

The purpose of these tools is to showcase how to interact with smart contracts on the CLI level.

#### tools/faucet/init.js

[tools/faucet/init.js](tools/faucet/init.js) is the only mandatory CLI tool you have to execute for this demo dApp in order to properly initialize the system.

Usage:
```
$ node tools/faucet/init.js --network NETWORK --token TEST_TOKEN_CONTRACT_ADDRESS --faucet FAUCET_CONTRACT_ADDRESS --amount AMOUNT
```

Example - sending 1,000,000 tokens to the faucet on the testnet:
```
$ node tools/faucet/init.js --network testnet --token 0xd801333222bffa78df2663f91f76a91dc0dea408 --faucet 0xbca23ecd4de7067e715119bd274904fea2e53526 --amount 1000000
```

#### tools/faucet/request.js

Usage:
```
$ node tools/faucet/request.js --network NETWORK --token TEST_TOKEN_CONTRACT_ADDRESS --faucet FAUCET_CONTRACT_ADDRESS
```

Example - requesting tokens from the faucet on the testnet:
```
$ node tools/faucet/request.js --network testnet --token 0xd801333222bffa78df2663f91f76a91dc0dea408 --faucet 0xbca23ecd4de7067e715119bd274904fea2e53526
```

#### tools/tokens/mint.js

Usage:
```
$ node tools/tokens/mint.js --network NETWORK --token TEST_TOKEN_CONTRACT_ADDRESS --amount AMOUNT
```

Example - minting 1,000,000 tokens on the testnet:
```
$ node tools/tokens/mint.js --network testnet --token 0xd801333222bffa78df2663f91f76a91dc0dea408 --amount 1000000
```

### UI

This demo dApp comes with a super minimal UI created in React.

![Token Faucet dApp UI](docs/token-faucet-dapp-screen.png)

The UI was originally forked from [Yearn's UI](https://github.com/iearn-finance/iearn-finance) but simplified to only showcase this dApp's functionality.

The UI also showcases wallet integration with Harmony's own [OneWallet](https://chrome.google.com/webstore/detail/harmony-one-wallet/gldpceolgfpjnajainimdfghhhgcnfmf/) as well as [MathWallet](https://chrome.google.com/webstore/detail/math-wallet/afbcbjpbpfadlkmhmclhkeeodmamcflc).

The UI also showcases the interaction with the faucet smart contract and allows the user to request funds from the faucet every x blocks (depending on the smart contract deployment).

#### A note on MetaMask and web3-react

Harmony isn't currently compatible with MetaMask. There's also nothing similar to [web3-react](https://github.com/NoahZinsmeister/web3-react) right now.

Harmony is looking into both MetaMask as well as creating a web3-react component compatible with OneWallet and MathWallet. Depending on when you read this, this tools might (or might not) have been implemented.

#### Development & deployment

To start the UI on http://localhost:3000, just run `yarn start`.

To create a production build, run `yarn build`.
