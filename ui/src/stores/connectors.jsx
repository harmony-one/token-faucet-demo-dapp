import config from '../config'

import { InjectedConnector } from "@web3-react/injected-connector";
// import { NetworkConnector } from "@web3-react/network-connector";
// import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
// import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";
import { TrezorConnector } from "@web3-react/trezor-connector";
// import { FrameConnector } from "@web3-react/frame-connector";
// import { FortmaticConnector } from "@web3-react/fortmatic-connector";
// import { PortisConnector } from "@web3-react/portis-connector";
// import { SquarelinkConnector } from "@web3-react/squarelink-connector";
// import { TorusConnector } from "@web3-react/torus-connector";
// import { AuthereumConnector } from "@web3-react/authereum-connector";

export const injected = new InjectedConnector({
  supportedChainIds: [config.chainId]
});

// export const network = new NetworkConnector({
//   urls: { config.chainId: config.rpcUrl },
//   defaultChainId: 1,
//   pollingInterval: POLLING_INTERVAL
// });
/*
export const walletconnect = new WalletConnectConnector({
  rpc: { config.chainId: config.rpcUrl] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
  url: config.rpcUrl,
  appName: "token-faucet-dapp"
});*/

export const ledger = new LedgerConnector({
  chainId: config.chainId,
  url: config.rpcUrl,
  pollingInterval: config.pollingInterval
});

export const trezor = new TrezorConnector({
  chainId: config.chainId,
  url: config.rpcUrl,
  pollingInterval: config.pollingInterval,
  manifestEmail: "dummy@abc.xyz",
  manifestAppUrl: "https://8rg3h.csb.app/"
});

/*export const frame = new FrameConnector({ supportedChainIds: [1666700000] });

export const fortmatic = new FortmaticConnector({
  apiKey: "pk_live_F95FEECB1BE324B5",
  chainId: 1666700000
});

export const portis = new PortisConnector({
  dAppId: "5dea304b-33ed-48bd-8f00-0076a2546b60",
  networks: [1,1666600000,2,1666700000]
});

export const squarelink = new SquarelinkConnector({
  clientId: "5f2a2233db82b06b24f9",
  networks: [1,1666600000,2,1666700000]
});

export const torus = new TorusConnector({ chainId: 1666700000 });

export const authereum = new AuthereumConnector({ chainId: 1666700000 });
*/
