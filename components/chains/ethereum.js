import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { fetcher } from "../../lib/fetch";
import { useWeb3React } from "@web3-react/core";
import { connectors } from "../../lib/connectors";
import Wallet from "../wallets/connect/Wallet";
import Button from "../elements/Button";
import Dropdown from "../elements/Dropdown";
import toast from "react-hot-toast";
import { AiOutlinePlus } from "react-icons/ai";
import AddWalletModal from "../modals/AddWalletModal";
import walletconnect from "../../public/walletconnectLogo.png";
import metamask from "../../public/metamasklogo.png";
import coinbase from "../../public/coinbase.png";
import ModalService from "../modals/services/ModalService";
import nonceText from "./nonceText.json";

const AddWallet = ({ wallets, setwallets, connectToWallet }) => {
	const add = (walletName) => {
		let name = walletName.toString().toLowerCase();
		var id = 0;
		for (const wal of wallets) {
			if (wal._id.indexOf(name) > -1) {
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

		const newConnection = name + (parseInt(id) + 1);
		const newElement = {
			_id: newConnection,
			address: "",
			name: newConnection,
		};
		setwallets([...wallets, newElement]);
		connectToWallet(newElement);
	};

	const [open, setOpen] = useState(false);
	const [walletOptions, setWalletOptions] = useState([
		{ name: "MetaMask", logo: metamask },
		{ name: "Coinbase", logo: coinbase },
		{ name: "WalletConnect", logo: walletconnect },
	]);

	const showWalletPopup = () => {
		ModalService.open(AddWalletModal, {
			wallets: walletOptions,
			add: add,
		});
	};

	return (
		<div
			className="bg-primary rounded-full h-auto p-2 w-max font-poppins font-normal text-sm hover:opacity-75 text-white cursor-pointer flex items-center justify-around gap-2"
			onClick={showWalletPopup}
		>
			<div>Add Wallet</div>
			<AiOutlinePlus />
		</div>
	);
};

export default function Ethereum({ user, mutate }) {
	const { library, activate, deactivate, active, account } = useWeb3React();
	const [newConnectionName, setNewConnectionName] = useState("");
	const [savedWallets, setSavedWallets] = useState(user.ethereum || []);
	const [wallets, setwallets] = useState(user.ethereum || []);

	const signMessage = useCallback(
		async (name, _id) => {
			if (!library) return;
			const response = await fetcher("/api/nonce", {
				method: "GET",
			});
			const nonce = nonceText.text + "Nonce: " + response.nonce;

			try {
				const signature = await library
					.getSigner(account)
					.signMessage(nonce);
				try {
					const response1 = await fetcher("/api/wallet/ethereum", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							walletAddr: account,
							signature: signature,
							walletId: _id,
							walletName: name,
						}),
					});
					mutate({ user: response1.user }, false);
					if ((response1.status = 200)) {
						setSavedWallets(response1.user.ethereum);
					}
				} catch (error) {
					if (error.message.indexOf("went wrong") > -1) {
						toast.error("Wallet already exists");
					}
				}
			} catch (e) {
				console.log(e);
			}
		},
		[account, library, mutate]
	);

	const connectToWallet = async (w) => {
		await deactivate();
		setNewConnectionName(w._id);
		if (w._id.toLowerCase().indexOf("metamask") > -1) {
			activate(connectors.injected);
		} else if (w._id.toLowerCase().indexOf("walletconnect") > -1) {
			activate(connectors.walletconnect);
		} else if (w._id.toLowerCase().indexOf("coinbase") > -1) {
			activate(connectors.coinbaseWallet);
		}
		if (account) {
			handleConnect();
		}
	};

	useEffect(() => {
		if (account) {
			handleConnect();
		}
	}, [account, handleConnect]);

	const handleConnect = useCallback(() => {
		var presentAlready = false;
		for (const wal of wallets) {
			if (wal.address.toLowerCase() == account.toLowerCase()) {
				presentAlready = true;
				break;
			}
		}
		var idInSavedWallets = false;
		for (const swal of savedWallets) {
			if (swal.address.toLowerCase() == account.toLowerCase()) {
				idInSavedWallets = true;
				break;
			}
		}

		if (!presentAlready && newConnectionName && !idInSavedWallets) {
			const newElement = {
				_id: newConnectionName,
				address: account,
				name: newConnectionName,
			};
			const replica = [...wallets];
			const index = wallets.findIndex((i) => i._id == newConnectionName);
			if (index == -1) {
				setwallets([...replica, newElement]);
			} else {
				replica[index] = newElement;
				setwallets(replica);
			}
		} else if (idInSavedWallets && !presentAlready) {
			deactivate();
			//setNewConnectionName(null);
		} else if (!idInSavedWallets && presentAlready && newConnectionName) {
			const replica = [...wallets];
			for (let i = 0; i < wallets.length; i++) {
				if (wallets[i].address.toLowerCase() == account.toLowerCase()) {
					const newEl = {
						_id: wallets[i]._id,
						address: "",
						name: wallets[i].name,
					};
					replica[i] = newEl;
					break;
				}
			}
			const newElement = {
				_id: newConnectionName,
				address: account,
				name: newConnectionName,
			};
			const index = replica.findIndex((i) => i._id == newConnectionName);
			if (index == -1) {
				setwallets([...replica, newElement]);
			} else {
				replica[index] = newElement;
				setwallets(replica);
			}
		}
	}, [account, deactivate, newConnectionName, savedWallets, wallets]);

	const disconnect = () => {
		deactivate();
	};

	const remove = useCallback(
		async (w) => {
			if (savedWallets.findIndex((i) => i.address == w.address) > -1) {
				try {
					const response = await fetcher("/api/wallet/delete", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							walletId: w._id,
							walletChain: "ethereum",
						}),
					});
					mutate({ user: response.user }, false);
					if ((response.status = 200)) {
						deactivate();
						setSavedWallets(response.user.ethereum);
						setwallets(response.user.ethereum);
					}
				} catch (e) {
					console.log(e);
				}
			} else {
				const index = wallets.findIndex((i) => i._id == w._id);
				const replica = [...wallets];
				replica.splice(index, 1);
				setwallets(replica);
			}
		},
		[deactivate, mutate, savedWallets, wallets]
	);

	return (
		<div className="w-full relative flex flex-col gap-4">
			<div
				className={`w-fit ${
					wallets.length > 0 ? `ml-auto` : `mx-auto w-full`
				}`}
			>
				<AddWallet
					connectToWallet={connectToWallet}
					wallets={wallets}
					setwallets={setwallets}
				/>
			</div>
			{wallets && (
				<div className="flex flex-col justify-start gap-2 w-full">
					{wallets.map((w, i) => {
						return (
							<Wallet
								key={w._id}
								id={w._id}
								displayName={w.name}
								connected={w.address?.indexOf(account) > -1}
								connectFunc={() => {
									connectToWallet(w);
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
								signMessage={signMessage}
								chain="ethereum"
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
