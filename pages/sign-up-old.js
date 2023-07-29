import { fetcher } from "../lib/fetch";
import { useCurrentUser } from "../lib/user";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";

const SignupPage = () => {
	const emailRef = useRef();
	const passwordRef = useRef();
	const usernameRef = useRef();
	const nameRef = useRef();

	const { data: { user } = {}, mutate } = useCurrentUser();

	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	if (user) {
		console.log(user);
		router.replace("/");
	}

	const onSubmit = useCallback(
		async (e) => {
			e.preventDefault();
			try {
				setIsLoading(true);
				const response = await fetcher("/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: emailRef.current.value,
						name: nameRef.current.value,
						password: passwordRef.current.value,
						username: usernameRef.current.value,
					}),
				});
				mutate({ user: response.user }, false);
				toast.success("Your account has been created");
				router.replace("/");
			} catch (e) {
				toast.error(e.message);
			} finally {
				setIsLoading(false);
			}
		},
		[mutate, router]
	);

	const goToSignIn = () => {
		router.replace("/sign-in");
	};

	return (
		<>
			<Head>
				<title>Sign up</title>
			</Head>
			<div className="text-center py-6 flex flex-col gap-8">
				<h1>Sign up</h1>
				<form
					onSubmit={onSubmit}
					className="py-6 flex flex-col gap-6 mx-auto w-72"
				>
					<Input
						ref={emailRef}
						type="email"
						autoComplete="email"
						placeholder="Email Address"
						aria-label="Email Address"
						required
					/>
					<Input
						ref={passwordRef}
						type="password"
						autoComplete="new-password"
						placeholder="Password"
						aria-label="Password"
						required
					/>
					<Input
						ref={usernameRef}
						type="text"
						autoComplete="username"
						placeholder="Username"
						aria-label="Username"
						required
					/>
					<Input
						ref={nameRef}
						type="text"
						autoComplete="name"
						placeholder="Your name"
						aria-label="Your name"
						required
					/>
					<Button
						type="submit"
						disabled={isLoading}
						text={isLoading ? "Loading..." : "Sign up"}
					/>
				</form>
				<div>
					Have an account?{" "}
					<span
						className="text-primary cursor-pointer hover:opacity-75"
						onClick={goToSignIn}
					>
						Sign in
					</span>
				</div>
			</div>
		</>
	);
};

export default SignupPage;
