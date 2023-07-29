import {
	findCollectionsBySlugEth,
	findNftsWithOwners,
} from "../../../../api-lib/db/collection";
import { database, auths } from "../../../../api-lib/middlewares";
import nc from "next-connect";
import { useEffect, useState, useRef } from "react";
import NFTCard from "../../../../components/nft/NFTCard";
import { useRouter } from "next/router";
import axios from "axios";
import { incrementCollectionViewCount } from "../../../../api-lib/db/analytics";

export default function CollectionPage({ collection, retrunNfts }) {
	const [nftData, setNftData] = useState(JSON.parse(retrunNfts));
	const router = useRouter();

	const open = (item) => {
		router.push({
			pathname: "../asset/[id]",
			query: {
				id: item._id,
				owner: JSON.stringify(item.owner),
			},
		});
	};

	return (
		<div className="w-full min-h-[100vh] relative">
			<div
				className="relative -top-2 md:mx-auto w-full h-[220px] flex justify-center items-center overflow-hidden bg-cover bg-center"
				style={{
					backgroundImage: `url(${collection.banner_image_url})`,
				}}
			></div>
			<div className="w-full px-28">
				<div className="full flex flex-wrap justify-between">
					<div className="flex flex-col basis-1/2 gap-4 mt-4">
						<div className="flex flex-row justify-start">
							<div className="mr-4 text-xl font-bold">
								{collection.name}
							</div>
							<div
								className="rounded-2xl bg-center bg-cover overflow-hidden h-6 w-6"
								style={{
									backgroundImage: `url(${collection.image_url})`,
								}}
							/>
						</div>
						<div className="flex flex-col justify-start">
							<div className="text-sm">
								{collection.description}
							</div>
						</div>
						<a
							href={collection.external_link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary"
						>
							<div className="text-sm hover:opacity-75">
								{collection.external_link}
							</div>
						</a>
						<a
							href={collection.discord_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary"
						>
							<div className="text-sm hover:opacity-50">
								{collection.discord_url}
							</div>
						</a>
						<a
							href={collection.telegram_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary"
						>
							<div className="text-sm w-2/3 mx-auto hover:opacity-50">
								{collection.telegram_url}
							</div>
						</a>
					</div>
					<div className="flex items-start pt-3 justify-between gap-3">
						<div className="flex flex-col">
							{/* <Link
                href={{
                  pathname: `/@${user?.username}/follows`,
                  query: { choice: "follows" },
                }}
                passHref
              >
                <div className="py-3 cursor-pointer hover:text-primary">
                  Follows: {user.following}
                </div>
              </Link>
              <Link
                href={{
                  pathname: `/@${user?.username}/follows`,
                  query: { choice: "following" },
                }}
                passHref
              >
                <div className="py-3 cursor-pointer hover:text-primary">
                  Followers: {user.followers}
                </div>
              </Link> */}
							{/* {data?.user?._id != user?._id && (
                <>
                  {user.requesterFollowingThisUser ? (
                    <button onClick={unfollow}>Following</button>
                  ) : (
                    <button onClick={follow}>Follow</button>
                  )}
                </>
              )} */}
							<div className="py-3 flex items-center gap-x-2">
								<div className="w-6 h-6 object-contain">
									{/* <Image
                    src={appreciateImg}
                    objectFit="contain"
                    alt="Appreciate"
                  /> */}
								</div>
								{/* <input ref={totalLikes} disabled={true} /> */}
							</div>
						</div>
						<div className="flex flex-col items-center py-3">
							{/* <div
                className="overflow-hidden rounded-2xl text-center flex justify-center items-center border-2 mx-auto md:w-[130px] md:h-[130px] cursor-pointer"
                onClick={() => open(user.profilePicture)}
              >
                {user.profilePicture?.metadata && (
                  <div
                    style={{
                      backgroundImage: `url(${
                        user.profilePicture.metadata.image ||
                        selectedNFTCard.metadata.image
                      }`,
                    }}
                    className="w-full h-full overflow-hidden bg-center bg-cover"
                  />
                )}
                {user.profilePicture.metadata ? null : "(Profile Picture)"}
              </div> */}
							{/* {poaps.length > 0 ? (
                <div
                  className="border-2 rounded-xl h-[30px] w-[130px] mt-3 overflow-auto scrollbar-hide cursor-pointer"
                  onClick={() => setShowPoaps(true)}
                >
                  <div className="h-full w-fit flex gap-x-3 mx-[0.4rem] items-center">
                    {poaps &&
                      poaps.map((poap, i) => {
                        return (
                          <img
                            key={i}
                            src={poap.event.image_url}
                            className="rounded-full h-6 w-6"
                          />
                        );
                      })}
                  </div>
                </div>
              ) : null} */}
						</div>
					</div>
				</div>
				<hr className="border-gray-400" />
				<div
					style={{
						gridAutoRows: "250px",
						gridTemplateColumns: "repeat(5, 200px)",
					}}
					className="h-full my-12 items-center justify-center grid gap-[30px] flex-wrap w-full pb-8"
				>
					{nftData &&
						nftData.map((nft) => {
							return (
								<div key={nft._id} className="h-full w-full">
									<NFTCard item={nft} click={() => null} />
									{/* - {nft.metadata.score}- {nft.metadata.rarity} */}
								</div>
							);
						})}
				</div>
			</div>
		</div>
	);
}

export async function getServerSideProps(context) {
	await nc()
		.use(database, ...auths)
		.run(context.req, context.res);

	if (!context.params.ethSlug) return;

	const collection = await findCollectionsBySlugEth(
		context.req.db,
		context.params.ethSlug
	);

	if (!collection) {
		return {
			notFound: true,
		};
	}

	//let nftArr = user.selected.map(o => o._id);
	//const nftsCursor = await findNfts(context.req.db, collection._id, context.req.user ? context.req.user._id : null);
	//const nfts = await nftsCursor.toArray() || [];

	const nftsCursor = await findNftsWithOwners(
		context.req.db,
		collection._id,
		context.req.user ? context.req.user._id : null,
		0
	);
	var nfts = (await nftsCursor.toArray()) || [];
	nfts = nfts[0].data;
	// nfts.forEach(nft => {
	//   console.log(nft.metadata.traits)
	// });
	// console.log(collection.traits)

	// Get ranks

	// Compute rarity of each nft - eth
	for (let i = 0; i < nfts.length; i++) {
		if (nfts[i]?.metadata.traits) {
			const traits = nfts[i].metadata.traits;
			let probabilityOfNftTraits = 1;
			let score = 0;
			for (const trait of traits) {
				if (
					"trait_type" in trait &&
					trait.trait_type in collection.traits &&
					"value" in trait &&
					trait.value.toLowerCase() in
						collection.traits[trait.trait_type]
				) {
					let nftsWithTrait =
						collection.traits[trait.trait_type][
							trait.value.toLowerCase()
						]; // Number
					let sum = 0; // All nfts with this type of trait
					for (const k in collection.traits[trait.trait_type]) {
						sum += collection.traits[trait.trait_type][k];
					}
					let probabilityOfTrait = nftsWithTrait / sum; // Compute probability of getting having this kind of trait for this trait type
					// console.log(probabilityOfTrait)
					probabilityOfNftTraits *= probabilityOfTrait;
					score += 1 - probabilityOfTrait; // Add up the rarity of each trait - alternative metric
				} else {
					console.log("nft trait not found in collection");
					probabilityOfNftTraits *= 1; // Assume that all nfts have this particular trait
				}
			}

			// console.log(`nft probability: ${probabilityOfNftTraits}`)
			nfts[i].metadata.rarity = 1 - probabilityOfNftTraits;
			nfts[i].metadata.score = score;

			// Get transactions
			const [contractAddress, tokenId] = nfts[i]._id.split("-");
			const ethToWei = 1000000000000000000;
			const ethToGwei = 1000000000;
			let nftTransactions = await fetch(
				`https://api.covalenthq.com/v1/1/tokens/${contractAddress}/nft_transactions/${tokenId}/?quote-currency=USD&format=JSON&key=ckey_66d8a9249e54440c9ef3f9a82c0`
			)
				.then((data) => data.json())
				.then((data) => data.data.items[0].nft_transactions)
				.then((txs) => {
					txs.forEach((tx) => {
						delete tx["log_events"];
						tx["value"] /= ethToWei;
						tx["gas_offered"] /= ethToGwei;
						tx["gas_spent"] /= ethToGwei;
						tx["gas_price"] /= ethToGwei;
						tx["fees_paid"] /= ethToWei;
						tx["type"] = tx["value"] <= 0.005 ? "Transfer" : "Sale";
					});
					if (txs.length > 0) txs[txs.length - 1]["type"] = "Mint";
					return txs;
				});
			// console.log(nftTransactions)
			nfts[i].transactions = nftTransactions;

			// Set rank
			nfts[i].rank = collection.ranksMap[nfts[i]._id.split("-")[1]];
		}
	}

	// Reorder array by rarity in ascending order - least rare to most rare
	nfts.sort(ascRarityComparator);

	const retrunNfts = JSON.stringify(nfts);

	// Analytics
	incrementCollectionViewCount(context.req.db, collection._id);

	return { props: { collection, retrunNfts } };
}

// Compare 2 nfts by rarity
function ascRarityComparator(a, b) {
	if (!a.metadata["rarity"] || !b.metadata["rarity"]) return 0;
	if (a.metadata.rarity < b.metadata.rarity) return -1;
	else if (a.metadata.rarity > b.metadata.rarity) return 1;
	else return 0;
}
