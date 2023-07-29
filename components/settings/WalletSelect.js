import ethereumLogo from "../../public/ethereum.png";
import tezosLogo from "../../public/tezos.png";
import solanaLogo from "../../public/solana.png";
import binanceLogo from "../../public/binance.png";
import Ethereum from "../../components/chains/ethereum";
import Solana from "../../components/chains/solana";
import Tezos from "../../components/chains/tezos";
import Binance from "../../components/chains/binance";
import All from "../../components/chains/all";
import Icon from "../../components/elements/Icon";
import Button from "../../components/elements/Button";
import { fetcher } from "../../lib/fetch";
import { useEffect, useMemo, useState } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { SolletWalletAdapter } from "@solana/wallet-adapter-sollet";
import { TorusWalletAdapter } from "@solana/wallet-adapter-torus";
import { clusterApiUrl } from "@solana/web3.js";
import {
	ConnectionProvider,
	WalletProvider,
} from "@solana/wallet-adapter-react";

import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import toast from "react-hot-toast";
import Updates from "../layout/updates";
function getLibrary(provider) {
	return new Web3Provider(provider);
}

export default function WalletSelect({ data, newUser, mutate }) {
	const [allNames, setAllNames] = useState([]);
	const [activeWallet, setActiveWallet] = useState(1);
	const [isUpdatingWallets, setIsUpdatingWallets] = useState(false);

	const network = WalletAdapterNetwork.Mainnet;
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);
	const walletsAvailable = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new GlowWalletAdapter(),
			new SolletWalletAdapter(),
			new SolflareWalletAdapter({ network }),
			new TorusWalletAdapter(),
		],
		[network]
	);

	const update = async () => {
		if (isUpdatingWallets) {
			toast.error("Already Queued for Update!");
			return;
		}
		setIsUpdatingWallets(true);
		const res = await fetcher("/api/user/update", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				newUser: newUser,
			}),
		});

		// console.log(res.queueSize)
		if (res.queueSize != undefined) {
			toast.success(`Queued for update - position ${res.queueSize + 1}`, {
				duration: 5000,
			});
		}
	};

	useEffect(() => {
		setActiveWallet(
			window.localStorage.getItem("activeWallet")
				? window.localStorage.getItem("activeWallet")
				: 0
		);
	}, []);

	useEffect(() => {
		//all of the user's previous ones will be accessible by "userWallets" using context after setAllNames
		setAllNames([
			{
				id: 0,
				isActive: activeWallet == 0,
				chain: "Active",
				component: (
					<All
						user={data?.user}
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
			},
			{
				id: 1,
				isActive: activeWallet == 1,
				chain: "Ethereum",
				component: (
					<Ethereum
						user={data?.user}
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
				img: ethereumLogo,
			},
			{
				id: 2,
				isActive: activeWallet == 2,
				chain: "Solana",
				component: (
					<Solana
						user={data?.user}
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
				img: solanaLogo,
			},
			/* 			{
				id: 3,
				isActive: activeWallet == 3,
				chain: "Tezos",
				wallets: ["beacon"],
				component: (
					<Tezos
						user={data?.user}
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
				img: tezosLogo,
			},
			{
				id: 4,
				isActive: activeWallet == 4,
				chain: "Binance",
				wallets: ["metamask", "walletconnect"],
				component: (
					<Binance
						user={data?.user}
						mutate={mutate}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				),
				img: binanceLogo,
			}, */
		]);
	}, [data?.user, mutate, setIsUpdatingWallets, activeWallet]);

	const style = {
		inactive: `text-sm p-2 flex items-center justify-between gap-2 text-gray-500 rounded-full hover:bg-black hover:text-white cursor-pointer transition duration-200 ease-in-out border-black border ${
			newUser ? "animate-pulse" : ""
		}`,
		active: `text-sm p-2 flex items-center bg-black text-white rounded-full justify-start gap-2`,
	};

	return (
		<section className="flex flex-col w-full h-full items-start justify-start gap-6 rounded-2xl bg-grey p-8">
			<div className="flex flex-wrap items-center md:justify-start w-full gap-4">
				{allNames.map((c, id) => (
					<div
						key={id}
						className={
							c.isActive ? `${style.active}` : `${style.inactive}`
						}
						onClick={() => {
							if (typeof window != undefined) {
								window.localStorage.setItem("activeWallet", id);
							}
							setActiveWallet(id);
						}}
					>
						{c.img ? (
							<Icon src={c.img} size={"sm"} />
						) : (
							<div className="h-4 w-4 bg-green-400 rounded-full" />
						)}
						<div>{c.chain}</div>
					</div>
				))}
				<div className="w-full flex flex-col gap-4">
					<Web3ReactProvider getLibrary={getLibrary}>
						<ConnectionProvider endpoint={endpoint}>
							<WalletProvider
								wallets={walletsAvailable}
								autoConnect
							>
								{allNames[activeWallet] &&
									allNames[activeWallet].component}
							</WalletProvider>
						</ConnectionProvider>
					</Web3ReactProvider>
					{isUpdatingWallets && (
						<Updates
							socketId={data.user._id}
							setIsUpdatingWallets={setIsUpdatingWallets}
						/>
					)}
					<div className="mx-auto">
						{(data?.user?.ethereum?.length > 0 ||
							data?.user?.solana?.length > 0) && (
							<Button onClick={update} text="Refresh wallets" />
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
