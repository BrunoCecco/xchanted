import React, { useEffect, useState, useRef } from "react";
import { useCurrentUser } from "../../lib/user";
import { fetcher } from "../../lib/fetch";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Index() {
	const { data, error } = useCurrentUser();
	const router = useRouter();
	const [following, setFollowing] = useState([]);
	const [permissions, setPermissions] = useState(null);
	const [talkingToUsrFollowing, setTalkingToUsrFollowing] = useState([]);
	const [userCollections, setUserCollections] = useState([]);

	useEffect(() => {
		if (!data && !error) return; // useCurrentUser might still be loading
		if (!data.user) {
			router.replace("/sign-in");
		}
	}, [router, data, error]);
	// if (!data?.user) return null

	useEffect(() => {
		//get most recent chat
		const getMostRecentChat = async () => {
			if (data?.user) {
				try {
					const recentChat = await fetcher(
						"/api/chats/getMostRecent",
						{
							method: "POST",
							body: JSON.stringify({
								user: data?.user._id,
							}),
						}
					);

					if (recentChat.length > 0) { // check that user has chats
						await router.replace(`/chats/${recentChat.toString()}`);
					}
				} catch (err) {
					console.log(err);
				}
			}
		};
		getMostRecentChat();
	}, [router, data, error]);

	/*
	useEffect(() => {
		//Collections
		const uniqueItems = [...new Set(data?.user.nfts)];
		const collectionIds = uniqueItems.map((item) =>
			item ? item.match(/.+?(?=-)/g)[0] : null
		);
		const fetchData = async () => {
			try {
				const res = await fetcher("/api/collection/getByIds", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						collectionIds: collectionIds,
					}),
				});
				console.log("user's collections", res);
				setUserCollections(JSON.parse(res));
			} catch (error) {
				console.log("error", error);
			}
		};

		fetchData();
	}, [data]);


	useEffect(() => {
		if (!data && !error) return;
		const fetchP = async () => {
			try {
				let res = await fetcher("/api/chats/permissions", {
					method: "POST",
					body: JSON.stringify({
						userid: data?.user._id.toString(),
					}),
				});
				console.log(res.r.following);
				return res;
			} catch (err) {
				console.log("error getting permissions on c page", err);
			}
		};

		fetchP().then((res) => {
			setFollowing(res.r.following);
		});
	}, [data]);
	*/

	const getTalkingTo = async (userid) => {
		try {
			return await fetcher(`/api/users/${userid}`);
		} catch (err) {
			console.log("no such user exists");
			console.log(err);
			toast.error("No user exists");
		}
	};

	const handleMessage = async (userid) => {
		const canTalkTo = async () => {
			if (
				permissions &&
				(permissions.chats == 1 ||
					(permissions.chats == 2 &&
						permissions.chatCol.length > 0 &&
						userCollections.filter(
							(x) => !permissions.chatCol.includes(x)
						)) ||
					(permissions.chats == 3 &&
						following.length > 0 &&
						talkingToUsrFollowing.filter(
							(f) => f == data?.user._id.toString()
						).length > 0))
			) {
				addConvo(userid);
			} else if (!permissions) {
				console.log("loading...");
				return;
			} else {
				//not allowed to talk to them
				console.log("not allowed!");
				toast.error(
					"Their permissions does not allow you to talk to them :("
				);
			}
		};
		getTalkingTo(userid)
			.then((talkingTo) => {
				console.log("talking to...", talkingTo);
				console.log("permissions...", talkingTo.user.permissions);
				setPermissions(talkingTo.user.permissions);
				setTalkingToUsrFollowing(
					talkingTo.user.following ? talkingTo.user.following : []
				);
			})
			.then(() => canTalkTo());
	};

	const addConvo = async (userid) => {
		//add convo -- only if the fromuser and touser doesn't already exist
		try {
			let convoid = "";
			//check if convo exists
			let usersArr = [data?.user._id.toString(), userid].sort();
			const exists = await fetcher("api/chats/checkChatExists", {
				method: "POST",
				body: JSON.stringify({
					usersArr: usersArr,
				}),
			});

			if (exists.length == 0) {
				getTalkingTo(userid).then((talkingTo) => {
					const makeConvo = async () => {
						console.log(
							"talking to name is: ",
							talkingTo.user.username.toString()
						);
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
						await fetcher("api/chats/addHistoryChat", {
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
						router.push(`chats/${convoid.toString()}`)
					);
				});
			} else {
				//exists
				convoid = exists[0]._id;
				console.log("convo id:", convoid);
				await fetcher("api/chats/addHistoryChat", {
					method: "POST",
					body: JSON.stringify({
						userid: data?.user._id.toString(),
						toid: userid,
						chatToAdd: convoid,
					}),
				});
				router.push(`chats/${convoid.toString()}`);
			}
		} catch (err) {
			console.log("Error making conversation");
			console.log(err);
		}
	};

	return (
		<div className="flex flex-col justify-center">
			{/* <button onClick={()=>{addConvo(data?.user._id)}}>press to talk to yourself</button>
            {following.length > 0 && following.map((f) => (
                <button key={f} onClick={()=>{handleMessage(f.toString())}}>Talk to {f}</button>
            ))} */}
			{/*go to most recent chat*/}
			Loading...
		</div>
	);
}
