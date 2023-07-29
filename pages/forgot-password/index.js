import { fetcher } from "../../lib/fetch";
import { useCallback, useRef, useState } from "react";
import Head from "next/head";
import toast from "react-hot-toast";
import Button from "../../components/elements/Button";
import Input from "../../components/elements/Input";

const ForgetPasswordPage = () => {
	const emailRef = useRef();
	const [loading, setLoading] = useState(false);

	const onSubmit = useCallback(async (e) => {
		setLoading(true);
		e.preventDefault();
		try {
			await fetcher("/api/user/password/reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: emailRef.current.value,
				}),
			});
			toast.success("Reset password email sent!");
			setLoading(false);
		} catch (e) {
			toast.error(e.message);
			setLoading(false);
			console.error(e.message);
		}
	}, []);

	return (
		<>
			<Head>
				<title>Forget password</title>
			</Head>
			<div className="text-center flex flex-col gradient w-full h-full">
				<div className="bg-white flex flex-col gap-6 mx-auto mt-6 max-w-[80vw] px-8 py-12 shadow-2xl rounded-2xl">
					<div className="text-2xl">Forgot password</div>
					<p>
						Enter the email address associated with your account,
						and we&apos;ll send you a link to reset your password.
					</p>
					<form
						onSubmit={onSubmit}
						className="pt-6 flex flex-col gap-6 mx-auto md:w-72 w-auto"
					>
						<Input
							ref={emailRef}
							type="email"
							autoComplete="email"
							placeholder="Email"
						/>
						<Button
							text={loading ? "Loading..." : "Submit"}
							onClick={onSubmit}
						/>
					</form>
				</div>
			</div>
		</>
	);
};

export default ForgetPasswordPage;
