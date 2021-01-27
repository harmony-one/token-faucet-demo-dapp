// Harmony
import localnet from "./localnet.config";
import testnet from "./testnet.config";
import mainnet from "./mainnet.config";

// Ethereum
import ropsten from "./ropsten.config";

require("dotenv").config();

const env = process.env.REACT_APP_APP_ENV || process.env.NODE_ENV || 'testnet';

const config = {
  localnet,
  testnet,
  mainnet,

  ropsten
};

export default config[env];
