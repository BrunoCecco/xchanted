import { fetcher } from "../../lib/fetch";
import { useCallback, useEffect, useState } from "react";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import Wallet from "../wallets/connect/Wallet";
import walletConnectLogo from "../../public/walletconnectLogo.png";

export default function WalletConnectComponent({
	user,
	walletid,
	chain,
	setIsUpdatingWallets,
}) {
	const getProvider = () => {
		if ("solana" in window) {
			const provider = window.solana;
			if (provider.isPhantom) {
				return provider;
			}
		}
	};

	const connect = useCallback(async () => {
		// Create a connector
		const connector = new WalletConnect({
			bridge: "https://bridge.walletconnect.org", // Required
			qrcodeModal: QRCodeModal,
		});

		if (!connector.connected) {
			// create new session
			connector.createSession();
		}

		// Subscribe to connection events
		let addr = "";
		connector.on("connect", async (error, payload) => {
			if (error) {
				throw error;
			}

			// Get provided accounts and chainId
			const { accounts, chainId } = payload.params[0];
			addr = accounts[0];
			console.log(accounts);
			console.log(chainId);
		});

		/*
    const response1 = await fetcher("/api/wallet/phantom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddr: walletAddr,
        signature: JSON.stringify(signature),
      }),
    });
    if(response1.status = 200) {
      setIsConnected(true);
    }*/
	}, []);

	const signPersonalMessage = useCallback(async () => {
		const response = await fetcher("/api/nonce", {
			method: "GET",
		});

		const nonce = response.nonce;

		try {
			const response = await connector.signPersonalMessage([
				nonce,
				connector.accounts[0].toLowerCase(),
			]);
			console.log("Sign Success Response: ", response);
			setIsUpdatingWallets(true);
			const response1 = await fetcher("/api/wallet/metamask", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					walletAddr: connector.accounts[0].toLowerCase(),
					signature: response,
				}),
			});
			mutate({ user: response1.user }, false);
			return response1.user[chain].walletConnect;
			if ((response1.status = 200)) {
				console.log("connected successfully");
			}
		} catch (e) {
			console.log(e);
		}
	}, [chain]);

	async function disconnect() {
		setIsUpdatingWallets(true);
		const response = await fetcher("/api/wallet/delete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				walletName: "walletconnect",
				walletChain: chain,
			}),
		});
		mutate({ user: response.user }, false);
		return response.user[chain].walletconnect;
		if (response.status == 200) {
			console.log("disconnected wallet successfully");
		}
	}

	return (
		<div>
			<Wallet
				name="WalletConnect"
				connectFunc={connect}
				disconnectFunc={disconnect}
				img={walletConnectLogo}
				walletid={walletid}
			/>
		</div>
	);
}
