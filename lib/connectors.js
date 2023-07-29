import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const injected = new InjectedConnector({
	supportedChainIds: [1],
});

const walletlink = new WalletLinkConnector({
	url: "https://cloudflare-eth.com",
	appName: "xChanted",
});

const walletconnect = new WalletConnectConnector({
	rpc: { 1: "https://cloudflare-eth.com" },
	bridge: "https://bridge.walletconnect.org",
	qrcode: true,
	pollingInterval: 12000,
});

export const connectors = {
	injected: injected,
	coinbaseWallet: walletlink,
	walletconnect: walletconnect,
};
