import { findCollectionById } from "../../../api-lib/db/collection";
import { database, auths } from "../../../api-lib/middlewares";
import nc from "next-connect";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Card from "../../../components/nft/card";
import Button from "../../../components/elements/Button";
import { incrementCollectionViewCount } from "../../../api-lib/db/analytics";
import { BiLinkExternal } from "react-icons/bi";
import FollowsLink from "../../../components/elements/FollowsLink";
import { fetcher } from "../../../lib/fetch";
import ClipLoader from "react-spinners/ClipLoader";
import toast from "react-hot-toast";
import { useCurrentUser } from "../../../lib/user";
import {
	FaDiscord,
	FaTwitter,
	FaHome,
	FaInstagram,
	FaMedium,
	FaTelegram,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import InfiniteScroll from "react-infinite-scroll-component";

const Link = ({ href, icon }) => {
	return (
		href != null &&
		href != "" &&
		href != "https://www.instagram.com/" &&
		href != "https://www.twitter.com/" &&
		href != "https://www.medium.com/@" && (
			<a href={href} target="_blank" rel="noopener noreferrer">
				<div className="truncate text-primary hover:opacity-50 cursor-pointer">
					{icon}
				</div>
			</a>
		)
	);
};

export default function CollectionPage({ collection }) {
	const { data, error, mutate } = useCurrentUser();
	const [nftData, setNftData] = useState([]);
	const [skip, setSkip] = useState(0);
	const [loading, setLoading] = useState(false);
	const [allLoaded, setAllLoaded] = useState(false);

	const router = useRouter();
	const [isFollowing, setIsFollowing] = useState(false);
	const [followers, setFollowers] = useState(collection.followers || []);

	const fetchData = useCallback(
		async (newLoad) => {
			setLoading(true);
			try {
				const nfts = await fetcher(
					"/api/collection/getNftsWithOwners",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							collectionId: collection._id,
							collectionTraits: collection?.traits,
							skip: newLoad ? 0 : skip,
						}),
					}
				);
				if (newLoad) {
					console.log(nfts);
					setNftData(nfts);
					setSkip(nfts.length);
					setAllLoaded(false);
				} else {
					setNftData(nftData.concat(nfts));
					setSkip(skip + 10);
				}
				if (nfts.length == 0) setAllLoaded(true);
			} catch (e) {
				console.log(e);
			} finally {
				setLoading(false);
			}
		},
		[collection._id, collection?.traits, nftData, skip]
	);

	useEffect(() => {
		fetchData("new");
	}, [collection._id]);

	useEffect(() => {
		if (data) {
			const isFollowing = data.user?.followingCollections?.includes(
				collection._id
			);
			setIsFollowing(isFollowing);
		}
	}, [data, collection._id]);

	const open = (item) => {
		router.push({
			pathname: "../asset/[id]",
			query: {
				id: item._id,
				owner: JSON.stringify(item.owner),
			},
		});
	};

	const unfollow = async () => {
		try {
			const response = await fetcher("/api/collection/follow", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					collectionId: collection._id,
				}),
			});
			setIsFollowing(false);
			setFollowers(response.followers || []);
			toast.success("Unfollowed: " + collection.name);
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
		}
	};

	const follow = async () => {
		try {
			const response = await fetcher("/api/collection/follow", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					collectionId: collection._id,
				}),
			});
			setIsFollowing(true);
			setFollowers(response.followers || []);
			toast.success("Followed: " + collection.name);
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
		}
	};

	return (
		<div className="w-full min-h-[100vh] relative">
			<div
				className="relative md:mx-auto w-full h-48 flex justify-center items-center overflow-hidden bg-cover bg-center"
				style={{
					backgroundImage: `url(${collection.banner_image_url})`,
				}}
			></div>
			<div className="w-full relative flex flex-col gap-4 md:px-28 px-8">
				<div className="absolute -top-20 flex sm:flex-col gap-2 sm:items-center items-end justify-center">
					<div className="basis-4/5">
						<div className="relative h-40 w-40 border-2 border-white rounded-2xl bg-black shadow-lg">
							<div
								className="rounded-2xl bg-center bg-cover overflow-hidden h-full w-full"
								style={{
									backgroundImage: `url(${collection.image_url})`,
								}}
							/>
						</div>
					</div>
					<div className="flex w-full gap-2 flex-wrap justify-center items-center mb-8">
						<Link
							href={collection.external_link}
							icon={<FaHome size={28} />}
						/>
						<Link
							href={collection.discord_url}
							icon={<FaDiscord size={28} />}
						/>
						<Link
							href={collection.telegram_url}
							icon={<FaTelegram size={28} />}
						/>
						<Link
							href={
								collection.instagram_username
									? "https://www.instagram.com/" +
									  collection.instagram_username
									: ""
							}
							icon={<FaInstagram size={28} />}
						/>
						<Link
							href={
								collection.medium_username
									? "https://www.medium.com/@" +
									  collection.medium_username
									: ""
							}
							icon={<FaMedium size={28} />}
						/>
						<Link
							href={
								collection.twitter_username
									? "https://www.twitter.com/" +
									  collection.twitter_username
									: ""
							}
							icon={<FaTwitter size={28} />}
						/>
					</div>
				</div>
				<div className="flex gap-2 pt-2 w-full md:top-0 top-24 md:pl-48 md:flex-nowrap flex-wrap relative justify-between items-start">
					<div className="flex flex-col gap-2 md:max-w-[40vw] min-h-[10rem]">
						<div className="text-xl font-bold flex gap-2 items-center flex-wrap">
							<div className="text-3xl">{collection.name}</div>
							{collection.safelist_request_status == "verified" ||
							collection.safelist_request_status == "approved" ? (
								<MdVerified
									className="text-primary"
									size={36}
								/>
							) : null}
						</div>
						<div className="text-sm text-gray-500">
							{collection.description}
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-2 justify-center right-2">
						{isFollowing ? (
							<Button
								onClick={unfollow}
								colour="black"
								filled={false}
								text="Following"
								size="sm"
							/>
						) : (
							<Button onClick={follow} text="Follow" size="sm" />
						)}
						<FollowsLink
							link={`/collection/${collection._id}/followers`}
							query={{ collectionId: collection._id }}
							number={followers?.length || 0}
							text="Followers"
						/>
					</div>
				</div>
				<hr className="w-full border-gray-300" />
				<div className="h-full w-full">
					<InfiniteScroll
						dataLength={nftData.length}
						next={fetchData}
						hasMore={true}
						loader={
							<ClipLoader
								loading={loading}
								size={20}
								color={"#000"}
							/>
						}
						style={{ overflow: "visible" }}
					>
						<div className="relative h-full md:top-0 top-24 items-center justify-center grid md:gap-6 gap-3 w-full pt-2 pb-8 md:grid-cols-[15vw_15vw_15vw_15vw_15vw] md:auto-rows-[15vw] auto-rows-[34vw] grid-cols-[34vw_34vw]">
							{nftData &&
								nftData.map((nft) => {
									return (
										<div
											key={nft._id}
											className="h-full w-full"
										>
											<Card
												user={
													nft.owner?.length > 0
														? nft.owner[0]
														: null
												}
												currentUser={null}
												item={nft}
												open={open}
												editing={false}
												multiSelecting={false}
											/>
										</div>
									);
								})}
						</div>
					</InfiniteScroll>
				</div>
			</div>
		</div>
	);
}

export async function getServerSideProps(context) {
	await nc()
		.use(database, ...auths)
		.run(context.req, context.res);

	const collection = await findCollectionById(
		context.req.db,
		context.params.collectionId
	);
	if (!collection) {
		return {
			notFound: true,
		};
	}

	//let nftArr = user.selected.map(o => o._id);

	/* const nftsCursor = await findNftsWithOwners(
		context.req.db,
		collection._id,
		context.req.user ? context.req.user._id : null,
		0
	);
	var nfts = (await nftsCursor.toArray()) || [];
	nfts = nfts[0].data; */

	// nfts.forEach((nft) => {
	//   console.log(nft.metadata.traits);
	// });

	// console.log(collection.traits);

	// Compute rarity of each nft
	/* for (let i = 0; i < nfts.length; i++) {
		const traits = nfts[i].metadata.traits;
		let probabilityOfNftTraits = 1;
		let score = 0;
		if (!traits && !Array.isArray(traits)) continue; // Skip if no traits or invalid traits
		for (const trait of traits) {
			if (
				trait &&
				"trait_type" in trait &&
				collection?.traits &&
				trait?.trait_type in collection?.traits &&
				"value" in trait &&
				trait?.value?.toString().toLowerCase() in
					collection?.traits[trait.trait_type]
			) {
				let nftsWithTrait =
					collection.traits[trait.trait_type][
						trait.value.toString().toLowerCase()
					]; // Number
				let sum = 0; // All nfts with this type of trait
				for (const k in collection.traits[trait.trait_type]) {
					sum += collection.traits[trait.trait_type][k];
				}
				let probabilityOfTrait = nftsWithTrait / sum; // Compute probability of getting having this kind of trait for this trait type
				// console.log(probabilityOfTrait);
				probabilityOfNftTraits *= probabilityOfTrait;
				score += 1 - probabilityOfTrait; // Add up the rarity of each trait - alternative metric
			} else {
				//console.log("nft trait not found in collection");
				probabilityOfNftTraits *= 1; // Assume that all nfts have this particular trait
			}
		}

		// console.log(`nft probability: ${probabilityOfNftTraits}`);
		nfts[i].metadata.rarity = 1 - probabilityOfNftTraits;
		nfts[i].metadata.score = score;
	} */

	// Reorder array by rarity in ascending order - least rare to most rare
	//nfts.sort(ascRarityComparator);

	//const returnNfts = JSON.stringify(nfts);

	// Analytics
	incrementCollectionViewCount(context.req.db, collection._id);
	return { props: { collection } };
}

// Compare 2 nfts by rarity
function ascRarityComparator(a, b) {
	if (!a.metadata["rarity"] || !b.metadata["rarity"]) return 0;
	if (a.metadata.rarity < b.metadata.rarity) return -1;
	else if (a.metadata.rarity > b.metadata.rarity) return 1;
	else return 0;
}
