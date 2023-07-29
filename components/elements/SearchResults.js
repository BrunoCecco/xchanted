import SearchResult from "./SearchResult";
import ProfilePicture from "./ProfilePicture";
import Username from "./Username";
import NftImage from "../nft/NftImage";
import Image from "next/image";
import { MdProfile } from "react-icons/md";
import solana from "../../public/solana.png";
import ethereum from "../../public/ethereum.png";
import binance from "../../public/binance.png";
import tezos from "../../public/tezos.png";
import { useState, useEffect } from "react";
import { useCurrentUser } from "../../lib/user";
import { fetcher } from "../../lib/fetch";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { UserRemoveIcon } from "@heroicons/react/outline";

export default function SearchResults({ results, router, setIsActive }) {
	const { data, error } = useCurrentUser();
	const [following, setFollowing] = useState([]); // -- mysterious error caused by /api/chats/permissions.js when user = null. i.e. search on login page
	const [userCollections, setUserCollections] = useState([]);
	const [userObjs, setUserObjs] = useState([]);

	useEffect(() => {
		if (!data || !error) return; // useCurrentUser might still be loading
		if (!data.user) {
			router.replace("/sign-in");
		}
	}, [router, data, error]);
	// if (!data?.user) return null

	useEffect(() => {
		if (!data?.user) return;
		//Collections
		const uniqueItems = [...new Set(data?.user?.nfts)];
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
				setUserCollections(JSON.parse(res));
			} catch (error) {
				console.log("error", error);
			}
		};

		fetchData();
	}, [results]);

	useEffect(() => {
		if (!data || !data?.user || !error) return;
		console.log("data", data);
		console.log('wtf')
		const fetchP = async () => {
			try {
				let res = await fetcher("/api/chats/permissions", {
					method: "POST",
					body: JSON.stringify({
						userid: data?.user._id.toString(),
					}),
				});
				return res;
			} catch (err) {
				console.log("error getting permissions on c page", err);
			}
		};

		fetchP().then((res) => {
			setFollowing(res.r.following);
		});
	}, [results]);

	const getTalkingTo = async (userid) => {
		if (!data?.user) return false;
		try {
			return await fetcher(`/api/users/${userid}`);
		} catch (err) {
			console.log("no such user exists");
			console.log(err);
			toast.err("No user exists");
		}
	};

	const handleMessage = async (userid) => {
		if (!data?.user) return false;
		return new Promise((resolve, reject) => {
			const canTalkTo = async (permissions, talkingToUsrFollowing) => {
				if (
					permissions &&
					(permissions.chats == 1 ||
						(permissions.chats == 2 &&
							permissions.chatCol.length > 0 &&
							userCollections.filter(
								(x) => !permissions.chatCol.includes(x)
							)) ||
						(permissions.chats == 3 &&
							talkingToUsrFollowing.length > 0 &&
							talkingToUsrFollowing.filter(
								(f) => f == data?.user._id.toString()
							).length > 0))
				) {
					//addConvo(userid)
					return true;
				} else {
					//not allowed to talk to them
					// toast.error("Their permissions does not allow you to talk to them :(")
					return false;
				}
			};
			getTalkingTo(userid).then(async (talkingTo) => {
				const r = await canTalkTo(
					talkingTo.user.permissions,
					talkingTo.user.following ? talkingTo.user.following : []
				);
				if (r) {
					resolve(r);
				}
			});
		});
	};

	const redirect = (url) => {
		router.push(url);
		setIsActive(false);
	};

	useEffect(() => {
		if (!data?.user) return false;
		const handleUser = async () => {
			return await Promise.all(
				results.users.map(async (user) => (
					<SearchResult
						key={user._id}
						id={user._id}
						onClick={() => redirect(`/@${user.username}`)}
						image={<ProfilePicture user={user} />}
						text={<Username user={user} />}
						includeMsgButton={await handleMessage(
							user._id.toString()
						).then((r) => {
							console.log("im in the handleuser", r);
							return r;
						})}
					/>
				))
			).then((res) => {
				setUserObjs(res);
			});
		};
		handleUser();
	}, [results]);

	return (
		<div className="absolute bg-white z-50 left-0 rounded-lg flex flex-col w-full shadow-xl max-h-[70vh] overflow-y-scroll">
			{results.users.length == 0 &&
				results.nfts.length == 0 &&
				results?.collections?.length == 0 && (
					// && results.chats.length == 0
					<div className="flex flex-col items-center justify-center h-full p-2">
						<div className="text-center text-gray-600">
							No results found
						</div>
					</div>
				)}

			{results.users && results.users.length > 0 && (
				<SearchResult key={"users"} text={"Users"} title={true} />
			)}
			<ul className="w-full relative">
				{results.users.map((user) => {
					return (
						<SearchResult
							key={user._id}
							id={user._id}
							onClick={() => redirect(`/@${user.username}`)}
							image={<ProfilePicture user={user} />}
							text={<Username user={user} />}
							includeMsgButton={true}
						/>
					);
				})}
			</ul>

			{userObjs && userObjs}
			{/* this will only be for group chats (i.e. chats without "," in their names)
			{results.chats && results.chats.length > 0 && (
				<SearchResult key={"chats"} text={"Chats"} title={true}/>
			)}
			{results.chats.map((chats) => {
				return (
					<SearchResult 
						key={chats._id}
						onClick={() => {
							redirect(`/c/${chats._id}`)
						}}
						image={chats.image}
						text={chats.name}
					/>
				)
			})} */}
			{results.collections && results.collections.length > 0 && (
				<SearchResult
					key={"collections"}
					text={"Collections"}
					title={true}
				/>
			)}
			<ul className="w-full relative">
				{results.collections.map((collection) => {
					return (
						<SearchResult
							key={collection._id}
							onClick={() =>
								redirect(`/collection/${collection._id}`)
							}
							image={
								<img
									src={collection.image_url}
									layout="fill"
									object-fit="cover"
									alt=""
								/>
							}
							text={collection.name}
							chainImg={
								collection.schema_name.toLowerCase() == "solana"
									? solana
									: collection.schema_name.toLowerCase() ==
										"erc721"
										? ethereum
										: collection.schema_name === "binance"
											? binance
											: collection.schema_name === "tezos"
												? tezos
												: null
							}
							verified={
								collection.safelist_request_status ==
								"verified" ||
								collection.safelist_request_status == "approved"
							}
						/>
					);
				})}
			</ul>
			{results.nfts && results.nfts.length > 0 && (
				<SearchResult key={"nfts"} text={"Nfts"} title={true} />
			)}
			<ul>
				{results.nfts.map((nft) => {
					return (
						<SearchResult
							key={nft._id}
							onClick={() => redirect(`/asset/${nft._id}`)}
							image={
								<NftImage
									metadata={nft.metadata}
									classname="w-full h-full bg-cover bg-center"
									click={() => redirect(`/asset/${nft._id}`)}
								/>
							}
							text={nft.metadata?.name || nft.name}
						/>
					);
				})}
			</ul>
		</div>
	);
}
