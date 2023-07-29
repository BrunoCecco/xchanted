import { fetcher } from "../../lib/fetch";
import { useEffect, useState } from "react";
import Wallet from "../wallets/connect/Wallet";
import phantomLogo from "../../public/phantomLogo.png";

export default function Phantom({
	user,
	walletid,
	mutate,
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

	async function connect() {
		try {
			const resp = await window.solana.connect();
		} catch (err) {
			// { code: 4001, message: 'User rejected the request.' }
		}
		const provider = getProvider();
		let walletAddr = provider.publicKey.toString();

		const response = await fetcher("/api/nonce", {
			method: "GET",
		});

		const nonce = response.nonce;

		const encodedMessage = new TextEncoder().encode(nonce);
		const signature = await solana.request({
			method: "signMessage",
			params: {
				message: encodedMessage,
			},
		});

		setIsUpdatingWallets(true);
		const response1 = await fetcher("/api/wallet/solana", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				walletAddr: walletAddr,
				signature: JSON.stringify(signature),
				walletName: "phantom",
			}),
		});
		mutate({ user: response.user }, false);
		return response1.user.solana.phantom;
		if (response1.status == 200) {
			console.log("connected successfully");
		}
	}

	async function disconnect() {
		window.solana.disconnect();
		setIsUpdatingWallets(true);
		const response = await fetcher("/api/wallet/delete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				walletName: "phantom",
				walletChain: "solana",
			}),
		});
		mutate({ user: response.user }, false);
		return response.user.solana.phantom;
		if (response.status == 200) {
			console.log("disconnected wallet successfully");
		}
	}

	return (
		<div>
			<Wallet
				name="Phantom"
				connectFunc={connect}
				disconnectFunc={disconnect}
				img={phantomLogo}
				walletid={walletid}
			/>
		</div>
	);
}
