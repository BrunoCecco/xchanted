import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetcher } from "../../lib/fetch";
import AddComment from "./addComment";
import Appreciate from "./appreciate";
import ClipLoader from "react-spinners/ClipLoader";
import { IoIosClose } from "react-icons/io";
import { useCurrentUser } from "../../lib/user";
import { useRouter } from "next/router";
import CollectionIcon from "../elements/CollectionIcon";
import Username from "../elements/Username";
import Comment from "../elements/Comment";

export default function Comments({ nft, username, ownerId }) {
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState(0);
	const [commentsSkip, setCommentsSkip] = useState(0);
	const [loading, setLoading] = useState(true);
	const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);
	const router = useRouter();

	const { data, error } = useCurrentUser();

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await fetcher(`/api/nft/${nft._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						skip: 0,
					}),
				});
				let comms = JSON.parse(response.comments)[0].data;
				setComments(comms);
				setAllCommentsLoaded(comms.length == 0);
			} catch (e) {
				console.log(e);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [nft, newComment]);

	const deleteComment = async (id) => {
		const response = await fetcher("/api/nft/comment", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				commentId: id,
			}),
		});
		setComments(comments.filter((comment) => comment._id != id));
	};

	const loadMore = async (newSkip) => {
		setLoading(true);
		try {
			const response = await fetcher(`/api/nft/${nft._id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					skip: newSkip,
				}),
			});
			let comms = JSON.parse(response.comments)[0].data;
			if (comms.length == 0) {
				setAllCommentsLoaded(true);
			} else {
				setCommentsSkip(newSkip);
				setComments(
					comments.concat(JSON.parse(response.comments)[0].data)
				);
			}
		} catch (e) {
			console.log(e);
			toast.error("Error loading more comments.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center gap-4 w-full mt-6">
			<AddComment
				nft={nft}
				mewComment={newComment}
				setNewComment={setNewComment}
			/>
			{comments && comments.length > 0 && (
				<div className="h-64 overflow-y-auto overflow-x-hidden w-full flex flex-col items-center gap-4 pr-4 pt-4">
					{comments
						.filter((comment) => comment.user?._id == ownerId)
						.map((item, index) => (
							<Comment
								key={"ownercomment" + index}
								comment={item}
								currentUser={data?.user?._id}
								ownerComment={true}
								deleteComment={deleteComment}
							/>
						))}
					{comments &&
						comments.map(
							(item, index) =>
								item.user?._id != ownerId && (
									<Comment
										key={"comment" + index}
										comment={item}
										currentUser={data?.user?._id}
										deleteComment={deleteComment}
									/>
								)
						)}
					{loading ? (
						<div className="my-4">
							<ClipLoader
								loading={loading}
								size={20}
								color={"#000"}
							/>
						</div>
					) : (
						<div
							className="text-gray-500 cursor-pointer"
							onClick={() => loadMore(commentsSkip + 6)}
						>
							{allCommentsLoaded ? "" : "Load more..."}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
