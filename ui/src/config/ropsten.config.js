require('dotenv').config()

const config = {
  rpcUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
  chainId: 3,
  pollingInterval: 12000,
  explorerUrl: 'https://ropsten.etherscan.io/',
  gas: {price: '100000000000', limit: '6721900'},
  addresses: {"token": "0x06B9feaa00D6c7e081406851B2A293075326261A", "faucet": "0x81AD83B5669F889BB63697Fc5d4a57682e14ef0b"}
};

export default config;
