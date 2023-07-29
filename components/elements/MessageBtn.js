import { MdSend } from "react-icons/md";
import { useCurrentUser } from "../../lib/user";
import { fetcher } from "../../lib/fetch";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";

const MessageBtn = ({ userid }) => {
	const { data, error } = useCurrentUser();
	const router = useRouter();

	const getTalkingTo = async (userid) => {
		try {
			return await fetcher(`/api/users/${userid}`);
		} catch (err) {
			console.log("no such user exists");
			console.log(err);
			toast.error("No user exists");
		}
	};

	const addConvo = async () => {
		//add convo -- only if the fromuser and touser doesn't already exist
		try {
			let convoid = "";
			//check if convo exists
			let usersArr = [data?.user._id.toString(), userid].sort();
			const exists = await fetcher("/api/chats/checkChatExists", {
				method: "POST",
				body: JSON.stringify({
					usersArr: usersArr,
				}),
			});

			if (exists.length == 0) {
				getTalkingTo(userid).then((talkingTo) => {
					const makeConvo = async () => {
						const res = await fetcher(
							"/api/chats/addConversation",
							{
								method: "POST",
								body: JSON.stringify({
									fromUser: data?.user._id.toString(),
									toUser: userid,
									name:
										data?.user.username.toString() +
										"," +
										talkingTo.user.username.toString(),
								}),
							}
						);
						convoid = res.r.insertedId.toString();
						await fetcher("/api/chats/addHistoryChat", {
							method: "POST",
							body: JSON.stringify({
								userid: data?.user._id.toString(),
								toid: userid,
								chatToAdd: convoid,
							}),
						});

						return convoid;
					};
					makeConvo().then((convoid) =>
						router.push({
							pathname: "/chats/[chatid]",
							query: { chatid: convoid },
						})
					);
				});
			} else {
				//exists
				convoid = exists[0]._id;
				await fetcher("/api/chats/addHistoryChat", {
					method: "POST",
					body: JSON.stringify({
						userid: data?.user._id.toString(),
						toid: userid,
						chatToAdd: convoid,
					}),
				});
				router.push({
					pathname: "/chats/[chatid]",
					query: { chatid: convoid.toString() },
				});
			}
		} catch (err) {
			console.log("Error making conversation");
			console.log(err);
		}
	};

	return (
		<div
			onClick={() => {
				addConvo();
			}}
			className="hover:bg-gray-200 rounded-full flex items-center h-full w-full p-2"
		>
			<MdSend />
		</div>
	);
};

export default MessageBtn;
