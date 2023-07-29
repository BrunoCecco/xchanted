import { database } from "../../api-lib/middlewares";
import { fetcher } from "../../lib/fetch";
import { useRef, useCallback, useState } from "react";
import nc from "next-connect";
import Head from "next/head";
import toast from "react-hot-toast";
import Button from "../../components/elements/Button";
import Input from "../../components/elements/Input";

const ResetPasswordTokenPage = ({ valid, token }) => {
	const passwordRef = useRef();
	const [loading, setLoading] = useState(false);

	const onSubmit = useCallback(
		async (event) => {
			setLoading(true);
			event.preventDefault();
			try {
				await fetcher("/api/user/password/reset", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						token: token,
						password: passwordRef.current.value,
					}),
				});
				toast.success("Password reset!");
				setLoading(false);
			} catch (e) {
				setLoading(false);
				toast.error(e.message);
				console.error(e.message);
			}
		},
		[token]
	);

	if (!valid)
		return (
			<>
				<h1>Invalid Link</h1>
				<p>
					It looks like you may have clicked on an invalid link.
					Please close this window and try again.
				</p>
			</>
		);

	return (
		<>
			<Head>
				<title>Forgot password</title>
			</Head>
			<div className="text-center flex flex-col gradient w-full h-full">
				<div className="bg-white flex flex-col gap-6 mx-auto mt-6 max-w-[80vw] px-8 py-12 shadow-2xl rounded-2xl">
					<div className="text-2xl">Forgot password</div>
					<p>Enter a new password for your account</p>
					<form
						onSubmit={onSubmit}
						className="pt-6 flex flex-col gap-6 mx-auto md:w-72 w-auto"
					>
						<Input
							ref={passwordRef}
							type="password"
							autoComplete="new-password"
							placeholder="New Password"
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

export async function getServerSideProps(context) {
	await nc().use(database).run(context.req, context.res);

	const tokenDoc = await context.req.db.collection("tokens").findOne({
		_id: context.params.token,
		type: "passwordReset",
	});

	console.log("tokenDoc", tokenDoc);

	return { props: { token: context.params.token, valid: !!tokenDoc } };
}

export default ResetPasswordTokenPage;
