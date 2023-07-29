import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCurrentUser } from "../../../lib/user";
import phantomLogo from "../../../public/phantomLogo.png";
import solflareLogo from "../../../public/solflareLogo.png";
import ClipLoader from "react-spinners/ClipLoader";
import metamaskLogo from "../../../public/metamasklogo.png";
import walletconnectLogo from "../../../public/walletconnectLogo.png";
import coinbaseLogo from "../../../public/coinbase.png";
import Button from "../../elements/Button";
import Status from "../../elements/Status";
import { fetcher } from "../../../lib/fetch";
import toast from "react-hot-toast";
import { BiCopy } from "react-icons/bi";
import { FiEdit } from "react-icons/fi";
import Input from "../../elements/Input";
import Icon from "../../elements/Icon";

export default function EthWallet({
	id,
	displayName,
	connectFunc,
	disconnectFunc,
	removeFunc,
	walletid,
	connected,
	signMessage,
	chain,
}) {
	const { mutate } = useCurrentUser();

	const [walletID, setWalletID] = useState(walletid);
	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [logo, setLogo] = useState(null);
	const [dName, setDName] = useState(displayName);
	const [editingName, setEditingName] = useState(false);

	useEffect(() => {
		setWalletID(walletid);
	}, [refresh, walletid]);

	useEffect(() => {
		const n = id.toLowerCase();
		if (n.indexOf("metamask") > -1) {
			setLogo(metamaskLogo);
		} else if (n.indexOf("walletconnect") > -1) {
			setLogo(walletconnectLogo);
		} else if (n.indexOf("coinbase") > -1) {
			setLogo(coinbaseLogo);
		} else if (n.indexOf("phantom") > -1) {
			setLogo(phantomLogo);
		} else if (n.indexOf("solflare") > -1) {
			setLogo(solflareLogo);
		}
	}, [id]);

	const handleNameChange = (e) => {
		setDName(e.target.value);
	};

	const updateName = async (e) => {
		try {
			const response = await fetcher("/api/wallet/editname", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: dName,
					walletChain: chain,
					walletId: id.toLowerCase(),
				}),
			});
			mutate({ user: response.user }, false);
			setEditingName(false);
			toast.success("Name has been updated");
		} catch (e) {
			toast.error("Error updating name");
			console.log(e);
		}
	};

	const copyAddress = () => {
		// copy walletID to clipboard
		navigator.clipboard.writeText(walletID);
		toast.success("Wallet address copied to clipboard");
	};

	return (
		<div className="flex flex-wrap bg-white w-full items-center justify-between p-4 gap-4 rounded-2xl shadow-md">
			{/* logo, wallet id and name */}
			<div className="flex gap-4 items-center">
				<div className="h-12 relative w-12 m-4 object-contain cursor-pointer hover:scale-110 transition transform duration-200 ease-out overflow-hidden bg-none">
					{logo && (
						<Image
							alt=""
							src={logo}
							objectFit="contain"
							layout="fill"
						/>
					)}
				</div>

				<div className="flex flex-col items-start justify-center gap-1">
					<div className="relative">
						{editingName ? (
							<Input
								value={dName}
								onChange={handleNameChange}
								onBlur={updateName}
								className="bg-grey !h-auto !w-fit border-none p-1 hover:shadow-inner"
							/>
						) : (
							<div className="relative">
								<div className="text-sm font-semibold">
									{dName}
								</div>
								<Icon
									className="absolute -right-4 top-0"
									onClick={() => setEditingName(true)}
									size="xs"
									colour={"gray-500"}
									icon={
										<FiEdit className="text-grey-dark hover:text-grey-darker cursor-pointer" />
									}
								/>
							</div>
						)}
					</div>
					<div
						className="flex items-center justify-center gap-2 text-xs text-gray-500 break-all cursor-pointer hover:opacity-75"
						onClick={copyAddress}
					>
						<div>{walletID}</div>
						{walletID && <BiCopy />}
					</div>
					<div className="flex flex-row gap-1">
						{walletID && (
							<Status text="Saved" size="sm" filled={false} />
						)}
						{walletID && connected && (
							<div onClick={disconnectFunc}>
								<Status
									text="Browser Connected"
									size="sm"
									filled={false}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="flex gap-4 items-center">
				<Button
					onClick={removeFunc}
					colour="red-500"
					filled={false}
					text="Remove"
				/>
				{connectFunc &&
					(connected ? (
						<>
							{!walletID && connected ? (
								<Button
									onClick={() => signMessage(displayName, id)}
									text="Verify &amp; Save"
								/>
							) : (
								<>
									{!walletID && (
										<div className="flex gap-4 items-center">
											<Button
												onClick={async () => {
													setLoading(true);
													try {
														const disc =
															await disconnectFunc();
														setLoading(false);
													} catch {
														setLoading(false);
													}
													console.log(
														"Pressed disconnect"
													);
												}}
												text={
													loading
														? "Disconnecting"
														: "Disconnect"
												}
											/>
											<ClipLoader
												loading={loading}
												size={20}
												color={"#000"}
											/>
										</div>
									)}
								</>
							)}
						</>
					) : (
						<>
							{!walletID && (
								<div className="flex gap-4 items-center">
									<Button
										onClick={async () => {
											setLoading(true);
											try {
												await connectFunc();
												setLoading(false);
											} catch {
												setLoading(false);
											}
											console.log("Pressed connect");
										}}
										text={
											loading ? "Connecting" : "Connect"
										}
									/>
									<ClipLoader
										loading={loading}
										size={20}
										color={"#000"}
									/>
								</div>
							)}
						</>
					))}
			</div>
		</div>
	);
}
