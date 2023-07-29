import { findNftWithOwner } from "../../../api-lib/db/user";
import { database, auths } from "../../../api-lib/middlewares";
import nc from "next-connect";
import Link from "next/link";
import Script from "next/script";
import Comments from "../../../components/nft/comments";
import { useRouter } from "next/router";
import Appreciate from "../../../components/nft/appreciate";
import { useEffect, useState } from "react";
import NftImageModal from "../../../components/modals/NftImageModal";
import NftImage from "../../../components/nft/NftImage";
import Suggested from "../../../components/nft/Suggested";
import { fetcher } from "../../../lib/fetch";
import { incrementNftViewCount } from "../../../api-lib/db/analytics";
import ModalService from "../../../components/modals/services/ModalService";
import CollectionIcon from "../../../components/elements/CollectionIcon";
import Button from "../../../components/elements/Button";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";
import toast from "react-hot-toast";

export default function NftPage({ nft, nftOwner, isProfilePicture }) {
	const router = useRouter();

	const [suggestedNfts, setSuggestedNfts] = useState([]); // TODO: Preferably show a loading animation while fetching
	const [metadata, setMetadata] = useState(
		nft.data?.metadata || nft?.metadata
	);
	const [owner, setOwner] = useState({});
	const [collection, setCollection] = useState(null);
	const [showTraits, setShowTraits] = useState(false);

	useEffect(() => {
		if (nftOwner) {
			setOwner(nftOwner);
		}
	}, [metadata, nft, nftOwner]);

	useEffect(() => {
		if (owner.username) {
			router.prefetch(`/@${owner.username}`);
		}
	}, [owner.username, router]);

	useEffect(() => {
		setMetadata(nft.data?.metadata || nft?.metadata);
	}, [nft]);

	useEffect(() => {
		const fetchRecommendations = async () => {
			const response = await fetch(
				`/api/nft/${nft._id}/recommendations`
			).then((data) => data.json());
			setSuggestedNfts(
				response.recommendedNfts ? response.recommendedNfts : []
			);
		};
		fetchRecommendations();

		const fetchCollection = async () => {
			console.log(nft._id.split("-")[0]);
			const res = await fetcher("/api/collection/getByIds", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					collectionIds: [nft._id.split("-")[0]],
				}),
			});
			const cols = res && res?.user != null && JSON.parse(res);
			console.log(cols);
			setCollection(cols && cols.length > 0 ? cols[0] : null);
		};
		fetchCollection();
	}, [nft]);

	const showModal = () => {
		ModalService.open(NftImageModal, { metadata });
	};

	const open = (item) => {
		router.push({
			pathname: "../asset/[id]",
			query: { id: item._id },
		});
	};

	const refreshMetadata = async (nft) => {
		try {
			const res = await fetcher("/api/nft/update", {
				method: "POST",
				body: JSON.stringify({
					nftId: nft._id,
				}),
			});
			toast.success(res.message || res.error);
			console.log(res.queueResponse);
		} catch (error) {
			console.log("error", error);
			toast.error(error.message);
		}
	};

	return (
		<>
			<Script
				type="module"
				src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
			></Script>
			<div className="flex items-start justify-around md:my-12 my-6 flex-wrap gap-6 md:gap-12 flex-col-reverse md:flex-row px-8 md:px-0">
				<div className="md:basis-[40%] relative h-full w-full mx-auto md:left-10">
					<div className="relative mx-auto mb-6 h-max w-max">
						<NftImage
							metadata={metadata}
							classname={
								"rounded-2xl shadow-2xl cursor-pointer bg-cover bg-center min-w[30vw] md:w-[40vw] w-[80vw] min-h-[30vh] max-h-[80vh] mx-auto bg-no-repeat relative"
							}
							click={showModal}
							inNftPage={true}
							showEverything={true}
						/>
						<Appreciate
							type={"nfts"}
							item={nft.data ? nft.data : nft}
							displayLikes={true}
						/>
					</div>
					<div
						className="w-full h-auto rounded-2xl p-4 flex flex-col items-center gap-4 overflow-hidden"
						style={{ paddingBottom: showTraits ? "2rem" : "0" }}
					>
						<Button
							text="Traits"
							icon={showTraits ? <BiUpArrow /> : <BiDownArrow />}
							className="w-full rounded-xl"
							filled={false}
							colour={"gray-400"}
							onClick={() => setShowTraits(!showTraits)}
						/>
						<div
							className={`w-full transition-all md:grid-cols-3 grid-cols-2 !duration-500 grid text-xs md:text-sm items-start justify-center gap-4 relative`}
							style={{
								maxHeight: showTraits ? "1000px" : "0px",
							}}
						>
							{metadata?.traits &&
								metadata.traits.map((item, index) => (
									<div
										key={index}
										className="p-2 mx-auto h-full w-full text-center border-2 border-gray-200 rounded-2xl bg-white shadow-xl"
									>
										{typeof item === "object" ? (
											<>
												<div className="break-words text-xs uppercase">
													{item.trait_type}
												</div>
												<div className="font-bold break-words text-sm">
													{item.value}
												</div>
											</>
										) : (
											<>
												<div className="font-bold line-clamp-1 text-xs uppercase ">
													{item}
												</div>
											</>
										)}
									</div>
								))}
						</div>
					</div>
					<div className="w-full rounded-2xl p-4 flex flex-col items-center gap-4 overflow-hidden">
						<Button
							text="Refresh Metadata"
							icon={null}
							className="w-full rounded-xl"
							filled={false}
							colour={"gray-400"}
							onClick={() => refreshMetadata(nft)}
						/>
					</div>
					<div className="block md:hidden w-full">
						<Comments nft={nft} ownerId={owner._id} />
					</div>
				</div>
				<div className="md:basis-[45%] flex flex-col items-center md:items-start justify-between gap-4 w-full mx-auto md:px-0 md:pr-10">
					<div className="text-4xl font-bold flex items-center justify-center gap-2">
						{collection && (
							<CollectionIcon collection={collection} size="lg" />
						)}
						<div>
							{metadata.name || nft?.data?.name || nft?.name}
						</div>
					</div>
					<div className="flex items-center justify-center gap-2">
						{nft.rank && (
							<div
								className="text-sm p-1 rounded-lg text-white"
								style={{
									backgroundImage:
										"linear-gradient(to right, #473be8,#e37291,#ffc846)",
								}}
							>
								#{nft.rank}
							</div>
						)}
					</div>
					{owner.username && (
						<div className="text-lg font-lite text-gray-900">
							<Link href={`/@${owner.username}`}>
								<a> Owned by: {owner.username}</a>
							</Link>
						</div>
					)}
					<div className="overflow-x-hidden overflow-y-auto text-sm text-gray-500 break-words">
						{metadata.description}
					</div>
					<div className="hidden md:block w-full">
						<Comments nft={nft} ownerId={owner._id} />
					</div>
				</div>
			</div>
			<Suggested
				suggestedNfts={suggestedNfts}
				metadata={metadata}
				nft={nft}
				open={open}
			/>
		</>
	);
}

export async function getServerSideProps(context) {
	if (!context.query.item) {
		await nc()
			.use(database, ...auths)
			.run(context.req, context.res);
		const nftCursor = await findNftWithOwner(
			context.req.db,
			[context.params.id],
			context.req.user ? context.req.user._id : null
		);
		const nft = await nftCursor.toArray();
		const returnNft = nft[0] || null;

		const rn = JSON.stringify(returnNft);
		const rn2 = JSON.parse(rn);

		let owner = {};
		if (rn2?.owner?.length > 0) {
			owner = rn2?.owner[0];
		}
		if (!returnNft) {
			return {
				redirect: {
					destination: "/404",
					permanent: false,
				},
			};
		} else {
			if (returnNft && returnNft._id) {
				// Analytics
				incrementNftViewCount(context.req.db, returnNft._id);
			}

			return {
				props: {
					nft: rn2,
					nftOwner: owner,
				},
			};
		}
	} else {
		await nc().use(database).run(context.req, context.res);
		const returnNft = JSON.parse(context.query.item);
		if (returnNft && returnNft._id) {
			// Analytics
			incrementNftViewCount(context.req.db, returnNft._id);
		}
		if (context.query.owner) {
			return {
				props: {
					nft: returnNft,
					nftOwner: JSON.parse(context.query.owner),
					isProfilePicture: JSON.parse(
						context.query.isProfilePicture
					),
				},
			};
		} else {
			return {
				props: {
					nft: returnNft,
				},
			};
		}
	}
}
