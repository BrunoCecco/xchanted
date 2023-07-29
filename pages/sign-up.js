import { fetcher } from "../lib/fetch";
import { useCurrentUser } from "../lib/user";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

import toast from "react-hot-toast";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import WalletSelect from "../components/settings/WalletSelect";
import Updates from "../components/layout/updates";
import Dropdown from "../components/elements/Dropdown";

const EARLY_ACCESS_CODE = "XCHANTED_OG_MEMBER_25";

const initialState = { step: 0 };

function reducer(state, action) {
	switch (action.type) {
		case "next":
			return { step: state.step + 1 };
		case "prev":
			return { step: state.step - 1 };
		default:
			throw new Error();
	}
}

const SignupPage = () => {
	const emailRef = useRef();
	const passwordRef = useRef();
	const repasswordRef = useRef();
	const usernameRef = useRef();
	const nameRef = useRef();
	const nameSelectRef = useRef();

	const { data, error, mutate } = useCurrentUser();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState({});
	const [ensNames, setEnsNames] = useState([]);
	const [userNfts, setUserNfts] = useState([]);
	const [selectedUsername, setSelectedUsername] = useState();
	const [isUpdatingWallets, setIsUpdatingWallets] = useState(false);
	const [accessCode, setAccessCode] = useState("");

	const [state, dispatch] = useReducer(reducer, initialState);

	const [hasAccess, setHasAccess] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setHasAccess(localStorage.getItem("hasAccess") ?? false);
		}
	});

	useEffect(() => {
		if (!data && !error) return; // useCurrentUser might still be loading
		if (data?.user) {
			setUser(data.user);
		}
	}, [data, error]);

	if (data?.user && state.step == 0 && !isLoading) {
		console.log(user);
		router.replace("/");
	}

	const goToSignIn = () => {
		router.replace("/sign-in");
	};

	useEffect(() => {
		const getEnsNames = async () => {
			try {
				const n = await fetcher("/api/collection", {
					method: "get",
				});
				let names = [];
				const nfts = JSON.parse(n);
				setUserNfts(nfts);
				nfts.map((nft) => {
					if (
						nft._id.includes(
							"0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"
						)
					) {
						names.push(nft);
					}
				});
				setEnsNames(names);
			} catch (err) {
				console.error(err.message);
			}
		};

		if (state.step == 2) {
			getEnsNames();
		}
	}, [state.step]);

	const selectEnsName = (e) => {
		setSelectedUsername({
			...userNfts.find((nft) => nft.name === e.value),
		});
		usernameRef.current.value = e.value
			.replace(".eth", "")
			.replace(".sol", "");
	};

	const onSubmit = useCallback(
		async (e) => {
			e.preventDefault();
			setIsLoading(true);
			if (passwordRef.current.value != repasswordRef.current.value) {
				toast.error("Passwords do not match");
				setIsLoading(false);
				return;
			}
			try {
				const response = await fetcher("/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: emailRef.current.value,
						password: passwordRef.current.value,
					}),
				});
				mutate({ user: response.user }, false);
				toast.success("Saved");
				dispatch({ type: "next" });
			} catch (e) {
				toast.error(e.message);
			} finally {
				setIsLoading(false);
			}
		},
		[mutate]
	);

	const onSubmitUsername = useCallback(
		async (e) => {
			e.preventDefault();
			setIsLoading(true);
			if (nameRef.current.value.indexOf(".") !== -1) {
				toast("Names cannot contain dots");
				nameRef.current.value = nameRef.current.value.replaceAll(
					".",
					""
				);
			}
			if (usernameRef.current.value.indexOf(".") !== -1) {
				toast("Usernames cannot contain dots");
				usernameRef.current.value =
					usernameRef.current.value.replaceAll(".", "");
			}
			try {
				const formData = new FormData();
				formData.append("name", nameRef.current.value);
				formData.append("username", usernameRef.current.value);
				if (selectedUsername != null) {
					formData.append(
						"usernameNFT",
						JSON.stringify(selectedUsername)
					);
				}
				const response = await fetcher("/api/user", {
					method: "PATCH",
					body: formData,
				});
				mutate({ user: response.user }, false);
				toast.success("User info Saved");
				dispatch({ type: "next" });
			} catch (e) {
				toast.error(e.message);
				console.error(e.message);
			} finally {
				setIsLoading(false);
			}
		},
		[mutate, selectedUsername]
	);

	const renderSwitch = (s) => {
		switch (s) {
			case 0:
				return (
					<div className="flex flex-col gap-6">
						<form
							onSubmit={onSubmit}
							className="pt-6 flex flex-col gap-6 mx-auto md:w-72 w-auto"
						>
							<Input
								ref={emailRef}
								name="email"
								type="email"
								autoComplete="email"
								placeholder="Email Address"
								aria-label="Email Address"
								required
								className="!rounded-full"
							/>
							<Input
								ref={passwordRef}
								name="password1"
								type="password"
								autoComplete="new-password"
								placeholder="Password"
								aria-label="Password"
								required
								className="!rounded-full"
							/>
							<Input
								ref={repasswordRef}
								name="password2"
								type="password"
								autoComplete="new-password"
								placeholder="Confirm Password"
								aria-label="Confirm Password"
								required
								className="!rounded-full"
							/>
							<Button
								onClick={onSubmit}
								className={isLoading ? "opacity-50" : ""}
								text={
									isLoading ? (
										<ClipLoader
											size={20}
											isLoading={true}
											color="#fff"
										/>
									) : (
										"Next"
									)
								}
							/>
							<div>
								Have an account?{" "}
								<span
									className="underline cursor-pointer hover:opacity-75"
									onClick={goToSignIn}
								>
									Sign in
								</span>
							</div>
						</form>
					</div>
				);
			case 1:
				return (
					<div className="py-6 flex flex-col gap-6 mx-auto w-[80vw]">
						<h4>Connect Your Wallets</h4>
						<WalletSelect
							data={data}
							newUser={true}
							mutate={mutate}
							setIsUpdatingWallets={setIsUpdatingWallets}
						/>
					</div>
				);
			case 2:
				return (
					<form
						onSubmit={onSubmitUsername}
						className="py-6 flex flex-col gap-6 mx-auto md:w-72 w-auto"
					>
						<div className="w-full relative">
							<Input
								name="username"
								type="text"
								ref={usernameRef}
								placeholder="Username"
								className="!rounded-full"
							/>
							<div className="absolute right-0 top-0">
								{ensNames.length > 0 && (
									<Dropdown
										ref={nameSelectRef}
										options={ensNames.map(
											(nft) =>
												nft.name || nft.metadata?.name
										)}
										value={"ENS Names"}
										onChange={selectEnsName}
									/>
								)}
							</div>
						</div>
						<Input
							ref={nameRef}
							type="text"
							autoComplete="name"
							placeholder="Your name"
							aria-label="Your name"
							required
							className="!rounded-full"
						/>
						<Button
							onClick={onSubmitUsername}
							className={isLoading ? "opacity-50" : ""}
							text={
								isLoading ? (
									<ClipLoader
										size={20}
										isLoading={true}
										color="#fff"
									/>
								) : (
									"Next"
								)
							}
						/>
					</form>
				);
			case 3:
				return (
					<div className="py-6 flex flex-col gap-6 mx-auto md:w-72 w-auto">
						<h1>
							Welcome to Xchanted, now it&apos;s time to customize
							your profile!
						</h1>
						<Link href="/account">
							<a>
								<Button
									text="Go to Profile"
									className="w-full"
								/>
							</a>
						</Link>
					</div>
				);
		}
	};

	const redeemAccessCode = (e) => {
		if (accessCode === EARLY_ACCESS_CODE) {
			toast.success("Early access redeemed!");
			setHasAccess(true);
			localStorage.setItem("hasAccess", true);
		} else {
			toast.error("Invalid early access code");
		}
	};

	return (
		<>
			<Head>
				<title>Sign up</title>
			</Head>
			<div className="text-center py-6 flex flex-col gap-8 gradient w-full h-full">
				<div className="bg-white mx-auto mt-6 px-8 py-12 shadow-2xl rounded-2xl">
					<h1 className="text-2xl">Sign up</h1>
					{!hasAccess ? (
						<form
							onSubmit={redeemAccessCode}
							className="py-6 flex flex-col gap-6 mx-auto md:w-72 w-auto"
						>
							<div>
								Enter your code to redeem early access to
								Xchanted
							</div>
							<Input
								placeholder="Early Access Code"
								onChange={(e) => setAccessCode(e.target.value)}
							/>
							<Button
								text="Submit"
								type="submit"
								onClick={redeemAccessCode}
							/>
						</form>
					) : (
						<>
							{isUpdatingWallets && (
								<Updates
									socketId={data?.user?._id}
									setIsUpdatingWallets={setIsUpdatingWallets}
								/>
							)}
							{renderSwitch(state.step)}
							{state.step > 0 && (
								<div className="md:w-72 w-auto relative flex flex-col gap-8 mx-auto">
									{state.step < 2 && (
										<Button
											text="Next"
											onClick={() =>
												dispatch({ type: "next" })
											}
											className="w-full"
										/>
									)}
									{state.step > 1 && state.step < 3 && (
										<Button
											text="Previous"
											onClick={() =>
												dispatch({ type: "prev" })
											}
											className="w-full"
										/>
									)}
									{state.step < 3 && (
										<div>
											Have an account?{" "}
											<span
												className="underline cursor-pointer hover:opacity-75"
												onClick={goToSignIn}
											>
												Sign in
											</span>
										</div>
									)}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default SignupPage;
