import React, { useEffect, useState, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import { fetcher } from "../../lib/fetch";
import WalletConnect from "../wallets/walletConnect";
import MetaMask from "../wallets/metamask";
import Phantom from "../wallets/phantom";
import Solflare from "../wallets/solflare";
import Beacon from "../wallets/beacon";
import Wallet from "../wallets/connect/Wallet";

export default function All({ user, mutate, setIsUpdatingWallets }) {
	const [connectedComponents, setConnectedComponents] = useState([]);
	const { library, activate, deactivate, active, account } = useWeb3React();

	useEffect(() => {
		let userWalletsObj = {
			ethereum: {
				metamask: (
					<MetaMask
						user={user}
						walletid={user.ethereum?.metamask}
						chain="ethereum"
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
				walletconnect: (
					<WalletConnect
						user={user}
						walletid={user.ethereum?.walletconnect}
						chain="ethereum"
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
			},
			solana: {
				phantom: (
					<Phantom
						user={user}
						walletid={user.solana?.phantom}
						chain="solana"
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
				solflare: (
					<Solflare
						user={user}
						walletid={user.solana?.solflare}
						chain="solana"
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
			},
			/*tezos: {
				beacon: (
					<Beacon
						user={user}
						walletid={user.tezos?.beacon}
						chain="tezos"
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
			},
			binance: {
				metamask: (
					<MetaMask
						user={user}
						walletid={user.binance?.metamask}
						chain="binance"
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
				walletconnect: (
					<WalletConnect
						user={user}
						walletid={user.binance?.walletconnect}
						chain="binance"
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
			},*/
		};
		const toLoad = [];

		for (const [chain, val] of Object.entries(userWalletsObj)) {
			if (!user[chain]) continue;
			for (const chainEl of user[chain]) {
				if (user[chain] && chainEl) {
					const comp = (
						<Wallet
							key={chainEl._id}
							id={chainEl._id}
							displayName={chainEl.name}
							connected={null}
							connectFunc={null}
							disconnectFunc={disconnect}
							removeFunc={() => remove(chainEl._id, chain)}
							walletid={chainEl.address}
							signMessage={null}
							chain={chain}
						/>
					);
					toLoad.push(comp);
				}

				/* const wallet = walletName.match(/.*?(?=[0-9])/);
          if (wallet) {
            toLoad.push(userWalletsObj[chain][wallet[0]]);
          } else {
            toLoad.push(userWalletsObj[chain][walletName]);
          } 
        }
      } */
				/* for (const [walletName, component] of Object.entries(val)) {
        if (user[key] && user[key][walletName] && user[key][walletName] != "") {
          toLoad.push(component);
        }
      } */
			}
		}
		setConnectedComponents(toLoad);
	}, [mutate, user]);

	const disconnect = () => {
		deactivate();
	};

	const remove = useCallback(
		async (w, chain) => {
			console.log(w);
			try {
				const response = await fetcher("/api/wallet/delete", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						walletId: w,
						walletChain: chain,
					}),
				});
				mutate({ user: response.user }, false);
			} catch (e) {
				console.log(e);
			}
		},
		[mutate]
	);

	return (
		<div className="flex flex-col justify-start gap-2 w-full">
			{connectedComponents.length == 0 ? (
				<div className="p-6">
					{
						"Connect your Ethereum or Solana wallet(s) to get started!"
					}
				</div>
			) : (
				connectedComponents.map((n, id) => <div key={id}>{n}</div>)
			)}
		</div>
	);
}
