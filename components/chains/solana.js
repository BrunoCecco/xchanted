import { fetcher } from "../../lib/fetch";
import { useEffect, useCallback, useState, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
	WalletModalProvider,
	WalletModalButton,
} from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");
import Wallet from "../wallets/connect/Wallet";
import toast from "react-hot-toast";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AiOutlinePlus } from "react-icons/ai";

export default function Solana({ user, mutate, setIsUpdatingWallets }) {
	const { connection } = useConnection();
	const {
		wallet,
		select,
		publicKey,
		connect,
		signMessage,
		disconnect,
		sendTransaction,
	} = useWallet();
	const [savedWallets, setSavedWallets] = useState(user.solana || []);
	const [wallets, setwallets] = useState(user.solana || []);
	const [status, setStatus] = useState(false);

	const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

	const [checked, setChecked] = useState(false);

	const handleChange = () => {
		setChecked(!checked);
	};

	const clickSign = useCallback(
		async (name, _id) => {
			if (checked) {
				if (!publicKey) throw new WalletNotConnectedError();

				const response = await fetcher("/api/nonce/ledger", {
					method: "GET",
				});
				const nonce = response.nonce;

				const transaction = new Transaction().add(
					SystemProgram.transfer({
						fromPubkey: publicKey,
						toPubkey: new PublicKey(nonce),
						lamports: 0,
					})
				);

				const signature = await sendTransaction(
					transaction,
					connection
				);
				console.log(signature);

				setStatus("Sending...");
				try {
					await connection.confirmTransaction(signature, "processed");
					setStatus("Verifying...");
				} catch (e) {
					console.log(e);
					setStatus(
						"Transaction taking abnormaly long, please wait. It is now being verified..."
					);
				}

				try {
					const response1 = await fetcher(
						"/api/wallet/solanaledger",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								publicKey: base58,
								signature: signature,
								walletId: _id,
								walletName: name,
							}),
						}
					);
					mutate({ user: response1.user }, false);
					if ((response1.status = 200)) {
						setSavedWallets(response1.user.solana);
					}
				} catch (error) {
					if (error.message.indexOf("went wrong") > -1) {
						toast.error("Wallet already exists");
					}
				} finally {
					setStatus(false);
				}
				//Normal sign message
			} else {
				const response = await fetcher("/api/nonce", {
					method: "GET",
				});
				const nonce = response.nonce;

				try {
					// `publicKey` will be null if the wallet isn't connected
					if (!publicKey) throw new Error("Wallet not connected!");
					// `signMessage` will be undefined if the wallet doesn't support it
					if (!signMessage)
						throw new Error(
							"Wallet does not support message signing!"
						);

					// Encode anything as bytes
					const message = new TextEncoder().encode(nonce);
					// Sign the bytes using the wallet
					const signature = await signMessage(message);

					try {
						const response1 = await fetcher("/api/wallet/solana", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								publicKey: Buffer.from(
									publicKey.toBytes()
								).toString("base64"),
								walletAddr: base58,
								signature:
									Buffer.from(signature).toString("base64"),
								walletId: _id,
								walletName: name,
							}),
						});
						mutate({ user: response1.user }, false);
						if ((response1.status = 200)) {
							setSavedWallets(response1.user.solana);
						}
					} catch (error) {
						if (error.message.indexOf("went wrong") > -1) {
							toast.error("Wallet already exists");
						}
					}
				} catch (error) {
					console.log("error", `Signing failed: ${error?.message}`);
				}
			}
		},

		[
			base58,
			checked,
			connection,
			mutate,
			publicKey,
			sendTransaction,
			signMessage,
		]
	);

	useEffect(() => {
		console.log("change base?");
		if (base58) {
			connect();
			handleConnect();
		}
	}, [base58, connect, handleConnect]);

	const handleConnect = useCallback(() => {
		var presentAlready = false;
		for (const wal of wallets) {
			if (wal.address.toLowerCase() == base58.toLowerCase()) {
				presentAlready = true;
			}
		}
		var idInSavedWallets = false;
		for (const swal of savedWallets) {
			if (swal.address.toLowerCase() == base58.toLowerCase()) {
				idInSavedWallets = true;
			}
		}

		if (!presentAlready && wallet.adapter.name && !idInSavedWallets) {
			var id = 0;
			for (const wal of wallets) {
				if (
					wal._id
						.toLowerCase()
						.indexOf(wallet.adapter.name.toLowerCase()) > -1
				) {
					var match = wal._id.match(/[0-9]+/g);
					if (match) {
						match = match[0];
					} else {
						match = 0;
					}

					if (match > id) {
						id = match;
					}
				}
			}

			const newConnection =
				wallet.adapter.name.toLowerCase() + (parseInt(id) + 1);
			const newElement = {
				_id: newConnection,
				address: base58,
				name: newConnection,
			};
			const replica = [...wallets];
			const index = wallets.findIndex((i) => i._id == newConnection);
			if (index == -1) {
				setwallets([...replica, newElement]);
			} else {
				replica[index] = newElement;
				setwallets(replica);
			}
		} else if (idInSavedWallets && !presentAlready) {
			deactivate();
			//setNewConnectionName(null);
		}
	}, [base58, savedWallets, wallet?.adapter?.name, wallets]);

	const remove = useCallback(
		async (w) => {
			if (savedWallets.findIndex((i) => i.address == w.address) > -1) {
				try {
					const response = await fetcher("/api/wallet/delete", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							walletId: w._id,
							walletChain: "solana",
						}),
					});
					mutate({ user: response.user }, false);
					if ((response.status = 200)) {
						disconnect();
						setSavedWallets(response.user.solana);
						setwallets(response.user.solana);
					}
				} catch (e) {
					console.log(e);
				}
			} else {
				const index = wallets.findIndex((i) => i._id == w._id);
				const replica = [...wallets];
				replica.splice(index, 1);
				setwallets(replica);
				disconnect();
			}
		},
		[disconnect, mutate, savedWallets, wallets]
	);

	return (
		<div className="w-full relative flex flex-col gap-4">
			<WalletModalProvider>
				<div
					className={`flex justify-center gap-4 ${
						wallets.length > 0 ? `ml-auto` : `mx-auto`
					}`}
				>
					<span className="flex items-center justify-between gap-2">
						<div className="text-black">Ledger:</div>
						<input
							type="checkbox"
							checked={checked}
							onChange={handleChange}
							className="rounded-full text-primary border-primary outline-primary ring-primary"
						/>
					</span>
					<WalletModalButton className="!h-auto !leading-normal">
						<div className="bg-primary rounded-full h-min p-2 w-max font-poppins font-normal text-sm hover:opacity-75 text-white cursor-pointer flex items-center justify-around gap-2">
							<div>Add Wallet</div>
							<AiOutlinePlus />
						</div>
					</WalletModalButton>
				</div>
				{status && <p>{status}</p>}
				<div className="flex flex-col justify-start gap-2 w-full">
					{wallets.map((w, i) => {
						return (
							<Wallet
								key={w._id}
								id={w._id}
								displayName={w.name}
								connected={w.address?.indexOf(base58) > -1}
								connectFunc={() => {
									disconnect();
									var cleanW = w._id.replace(/[0-9]/g, "");
									cleanW =
										cleanW.charAt(0).toUpperCase() +
										cleanW.slice(1);
									select(cleanW);
								}}
								disconnectFunc={disconnect}
								removeFunc={() => remove(w)}
								walletid={() => {
									for (const swal of savedWallets) {
										if (
											swal._id.toLowerCase() ==
											w._id.toLowerCase()
										) {
											return swal.address;
										}
									}
								}}
								signMessage={() => clickSign(w.name, w._id)}
								chain="solana"
							/>
						);
					})}
				</div>
			</WalletModalProvider>
		</div>
	);
}
