import { useEffect, useState } from "react";
import { fetcher } from "../lib/fetch";
import NftImage from "../components/nft/NftImage";
import InfiniteScroll from "react-infinite-scroll-component";
import CollectionIcon from "../components/elements/CollectionIcon";
import Head from "next/head";
import Link from "next/link";
import ProfilePicture from "../components/elements/ProfilePicture";
import Username from "../components/elements/Username";
import Button from "../components/elements/Button";
import UserTag from "../components/elements/UserTag";

export default function Lounge() {
	const [nfts, setNfts] = useState([]);
	const [limitNfts, setLimitNfts] = useState(20); // Get stuff 20 at a time
	const [offset, setOffset] = useState(0);

	const [collections, setCollections] = useState([]);
	const [limitCollections, setLimitCollections] = useState(20);

	const [users, setUsers] = useState([]);
	const [limitUsers, setLimitUsers] = useState(20);
	const [suggestedUsers, setSuggestedUsers] = useState(4);

	useEffect(async () => {
		let data = await fetcher(
			`/api/lounge/browse?limitNfts=${limitNfts}&offset=${offset}`
		);
		setNfts(
			nfts.concat(
				data.nfts.filter(
					(nft) => !nfts.find((nft2) => nft2._id === nft._id)
				)
			)
		);
		console.log(data);
	}, [offset]);

	useEffect(async () => {
		let data = await fetcher(
			`/api/lounge/collections?limitCollections=${limitCollections}`
		);
		setCollections(data.collections);
	}, []);

	useEffect(async () => {
		let data = await fetcher(`/api/lounge/users?limitUsers=${limitUsers}`);
		setUsers(data.users);
	}, []);

	const fetchMoreNfts = async () => {
		setOffset(offset + limitNfts);
	};

	const fetchMoreUsers = async () => {
		// TODO : Button to show more suggested users
		setSuggestedUsers(suggestedUsers + 5);
	};

	return (
		<>
			<Head>
				<title>Lounge</title>
			</Head>
			<div className="gradientMaxHeight">
				<div className="wrapper flex flex-row gap-8 p-8 w-[95vw] md:w-[90vw] mx-auto relative bg-white rounded">
					<div className="flex flex-col w-3/4 h-fit rounded-lg">
						<div className="font-bold text-4xl text-center py-4">
							Collections To Follow
						</div>
						<div className="grid grid-rows-3 grid-cols-3 gap-4 border bg-slate-50 rounded-xl">
							{collections.slice(0, 9).map((collection) => (
								<Link key={collection._id} href={`/collection/${collection._id}`}>
									<div className="grid place-items-center text-center py-4 rounded-2xl hover:bg-gradient-to-r from-purple-300 to-pink-300 hover:text-white">
										<span className="px-2 text-lg">
											{collection.name}
										</span>

										<img
											src={collection.image_url}
											className="rounded-full max-h-[120px]"
										/>
									</div>
								</Link>
							))}
						</div>
						<div className="flex flex-col w-full p-8 place-items-center">
							<InfiniteScroll
								dataLength={nfts.length}
								next={() => fetchMoreNfts()}
								hasMore={true}
								loader={
									<div className="w-full p-4 text-center text-lg">
										Loading...
									</div>
								}
							>
								{nfts &&
									nfts.map((nft) => (
										<div
											key={nft._id}
											className="flex flex-col gap-2 m-4 bg-slate-50 border-2 border-slate-100 rounded-md items-center"
										>
											<div className="flex text-2xl pt-2">
												<span className="mx-2 my-1">
													{nft.collection && (
														<CollectionIcon
															collection={
																nft.collection
															}
														/>
													)}
												</span>
												{nft?.metadata?.name}{" "}
												<span className="mx-2 px-2 h-fit border rounded-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white">
													{nft?.explainer}
												</span>
											</div>
											<div>
												<NftImage
													key={nft.id}
													metadata={nft.metadata}
													classname={
														"cursor-pointer shadow-xl bg-cover bg-center overflow-hidden rounded-2xl max-h-[600px]"
													}
													inNftPage={true}
												/>
											</div>

											<div className="w-2/3 bg-white rounded-2xl">
												{/*nft.owner && (
														<UserTag
															user={nft.owner}
														/>
													)*/}
											</div>
										</div>
									))}
							</InfiniteScroll>
						</div>
					</div>

					<div className="flex flex-col w-1/4 h-fit border-solid border rounded-lg bg-slate-50">
						<div className="text-2xl text-center py-4">
							Users To Follow
						</div>
						<div className="flex flex-col p-4 gap-2 h-max rounded-lg">
							{users.slice(0, suggestedUsers).map((user) => (
								<div
									key={user._id}
									className="bg-slate-50 rounded-2xl"
								>
									<Link href={`/@${user.username}`}>
										<div className="flex flex-col flex-wrap rounded-xl justify-start items-center border-2 shadow hover:shadow-xl p-2">
											<div className="h-20 w-20 rounded-2xl">
												<ProfilePicture user={user} />
											</div>
											<div className="max-w-max py-1">
												<Username user={user} />
											</div>
											<div>
												<Button
													className="text-xs text-white"
													text="Follow"
												/>
											</div>
										</div>
									</Link>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
