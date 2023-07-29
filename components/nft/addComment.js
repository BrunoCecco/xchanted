import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { fetcher } from "../../lib/fetch";
import { useCurrentUser } from "../../lib/user";
import Input from "../elements/Input";
import Button from "../elements/Button";

export default function AddComment({ nft, newComment, setNewComment }) {
	const { data, error, mutate } = useCurrentUser();
	const inputRef = useRef(null);

	if (!data?.user) return null;

	const addComment = async (event) => {
		event.preventDefault();

		const res = await fetcher("/api/nft/comment", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				nftId: nft._id,
				text: inputRef.current.value,
			}),
		});

		setNewComment(Math.random() * 10);
		inputRef.current.value = "";

		if (res.status == 200) {
			toast.success("Comment Added!");
		}
	};

	return (
		<form
			onSubmit={addComment}
			className="flex w-full gap-2 items-center justify-center flex-wrap relative mx-auto"
		>
			<Input
				ref={inputRef}
				name="text"
				type="text"
				placeholder={"Write comment..."}
				required
				className="pr-20"
			/>
			<div className="absolute right-2">
				<Button onClick={addComment} text="Post" size="xs" />
			</div>
		</form>
	);
}
