import { fetcher } from "../lib/fetch";
import { useCurrentUser } from "../lib/user";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Head from "next/head";
import Image from "next/image";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import uDomainsImg from "../public/unstoppabledomains.png";
import UAuth from "@uauth/js";

const ActivateUauth = ({ mutate, setIsLoading }) => {
	const uauth = new UAuth({
		clientID: "8b8494ce-2bb6-4616-8ac1-abed1a4a79c9",
		redirectUri: "https://www.xchanted.com/sign-in",
		scope: "openid wallet",
	});

	const loginTest = async () => {
		setIsLoading(true);
		try {
			const authorization = await uauth.loginWithPopup();
			var headers = new Headers();
			headers.append(
				"Authorization",
				"Bearer " + authorization.idToken.__raw
			);
			try {
				const response = await fetcher("/api/udauth", {
					method: "POST",
					headers: headers,
				});
				mutate({ user: response.user }, false);
				toast.success("You have been logged in.");
			} catch (e) {
				toast.error("Login error.");
				console.error(e);
			} finally {
				setIsLoading(false);
			}
		} catch (error) {
			setIsLoading(false);
			console.error(error);
		}
	};

	return (
		<>
			<button
				onClick={() => {
					loginTest();
				}}
				className="mx-auto flex gap-2 items-center hover:opacity-75"
			>
				<Image src={uDomainsImg} width={50} height={50} alt="" />
				<div>Sign in with Unstoppable Domains</div>
			</button>
		</>
	);
};

const LoginPage = () => {
	const emailRef = useRef();
	const passwordRef = useRef();

	const [isLoading, setIsLoading] = useState(false);

	const { data: { user } = {}, mutate, isValidating } = useCurrentUser();
	const router = useRouter();
	useEffect(() => {
		if (isValidating) return;
		if (user) router.replace("/");
	}, [user, router, isValidating]);

	const onSubmit = async (event) => {
		setIsLoading(true);
		console.log("SIGNING IN");
		event.preventDefault();
		try {
			const response = await fetcher("/api/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: emailRef.current.value,
					password: passwordRef.current.value,
				}),
			});
			mutate({ user: response.user }, false);
			toast.success("You have been logged in.");
		} catch (e) {
			toast.error("Incorrect email or password.");
		} finally {
			setIsLoading(false);
		}
	};

	const goToSignUp = () => {
		router.replace("/sign-up");
	};

	const resetPassword = () => {
		router.replace("/forgot-password");
	};

	return (
		<>
			<Head>
				<title>Sign in</title>
			</Head>
			<div className="text-center flex flex-col gradient w-full h-full">
				<div className="bg-white mx-auto mt-6 max-w-[80vw] px-8 py-12 shadow-2xl rounded-2xl">
					<h1 className="text-2xl">Sign in</h1>
					<form
						onSubmit={onSubmit}
						className="pt-6 flex flex-col gap-8 md:w-72 w-auto mx-auto"
					>
						<Input
							ref={emailRef}
							id="email"
							type="email"
							name="email"
							placeholder="Email Address"
							autoComplete="email"
							className="!rounded-full"
						/>
						<Input
							ref={passwordRef}
							id="password"
							type="password"
							name="password"
							placeholder="Password"
							autoComplete="current-password"
							className="!rounded-full"
						/>
						<Button
							onClick={onSubmit}
							size={"large"}
							disabled={isLoading}
							text={isLoading ? "Loading..." : "Sign in"}
						/>
						<ActivateUauth
							mutate={mutate}
							setIsLoading={setIsLoading}
						/>
					</form>
					<div className="py-4">
						<span
							className="underline cursor-pointer hover:opacity-75"
							onClick={resetPassword}
						>
							Forgot password?
						</span>
					</div>
					<div>
						Do not have an account?{" "}
						<span
							className="underline cursor-pointer hover:opacity-75"
							onClick={goToSignUp}
						>
							Sign up
						</span>
					</div>
				</div>
			</div>
		</>
	);
};

export default LoginPage;
