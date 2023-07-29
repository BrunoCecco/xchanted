import {
	findCollectionsBySlugSol,
	findSolNftsByUpdateAuth,
} from "../../../../api-lib/db/collection";
import { database, auths } from "../../../../api-lib/middlewares";
import nc from "next-connect";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import NFTCard from "../../../../components/nft/NFTCard";
import { incrementCollectionViewCount } from "../../../../api-lib/db/analytics";

export default function CollectionPage({ collection, nfts }) {
	const [nftData, setNftData] = useState(nfts);
	const router = useRouter();

	const open = (item) => {
		router.push({
			pathname: "../asset/[id]",
			query: {
				id: item._id,
				username: JSON.stringify(user.username),
				ownerId: JSON.stringify(user._id),
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

	if (!context.params.solSlug) return;

	const collection = await findCollectionsBySlugSol(
		context.req.db,
		context.params.solSlug
	);

	if (!collection) {
		return {
			notFound: true,
		};
	}

	// console.log(`${collection.rarity}`)
	//let nftArr = user.selected.map(o => o._id);
	const nftsCursor = await findSolNftsByUpdateAuth(
		context.req.db,
		collection._id,
		context.req.user ? context.req.user._id : null
	);
	const nfts = (await nftsCursor.toArray()) || [];

	const moonRankSlug = collection.name.replaceAll(" ", "_").toLowerCase();
	// get global rank
	console.log(
		"https://moonrank.app/mints/" + moonRankSlug + "?complete=false"
	);
	const ranksMap = await fetch(
		"https://moonrank.app/mints/" + moonRankSlug + "?complete=false"
	)
		// .then(data => {
		//     console.log('https://moonrank.app/mints/' + moonRankSlug + '?complete=false')
		//     console.log(JSON.stringify(data))
		//     return data;
		// })
		.then((response) => {
			if (response.status != 200) return null;
			try {
				console.log(`status ${response.status}`);
				if (response) return response.json();
			} catch (e) {
				return null;
			}
		})
		.then((data) => {
			if (data && "mints" in data) return data.mints;
		})
		.then((nfts) => {
			if (!nfts) return {};
			// console.log(nfts)
			const map = {};
			for (const nft of nfts) {
				map[nft.mint] = nft.rank;
			}
			return map;
		});
	console.log(JSON.stringify(ranksMap));

	// Compute rarity of each nft - eth
	for (let i = 0; i < nfts.length; i++) {
		const traits = nfts[i].metadata.traits;
		let probabilityOfNftTraits = 1;
		let score = 0;
		for (const trait of traits) {
			if (
				"trait_type" in trait &&
				"value" in trait &&
				collection.rarity &&
				trait.trait_type + ":" + trait.value in collection.rarity
			) {
				let probabilityOfTrait =
					collection.rarity[trait.trait_type + ":" + trait.value] /
					100; // Compute probability of getting having this kind of trait for this trait type
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

		const [updateAuth, mint] = nfts[i]._id.split("-");
		// Get transactions - add this to the api
		const transactions = await fetch(
			`https://api.solanart.io/last_sales_token?address=${mint}`
		)
			.then((data) => data.json())
			.then((txs) => {
				txs.forEach((tx) => {
					delete tx["id"];
					delete tx["token_add"];
					delete tx["link_image"];
					delete tx["name"];
					delete tx["description"];
					delete tx["attributes"];
					delete tx["skin"];
					delete tx["type"];
					delete tx["indexBis"];
					delete tx["state"];
					tx["type"] = "Sale";
				});
				// if (txs.length > 0) txs[txs.length - 1]['type'] = 'Mint'
				return txs;
			});
		// console.log(nftTransactions)
		// const solana = new web3.Connection("https://api.mainnet-beta.solana.com");
		// const publicKey = new web3.PublicKey(mint)
		// const signatures = await solana.getSignaturesForAddress(publicKey, {
		//     limit: 1000
		// })
		// console.log(signatures);

		// const lamportsToSol = 0.000000001;
		// for(const { signature } of signatures) {
		//     const tx = await solana.getTransaction(signature);
		//     // console.log(tx);
		//     let type = null, value = -1, fees = lamportsToSol * tx.meta.fee;
		//     for (const log of tx.meta.logMessages) {
		//         if (log.indexOf("Instruction: InitializeMint") != -1) {
		//             type = 'Mint';
		//             break;
		//         } else if (log.indexOf("Instruction: Buy") != -1) {
		//             type = 'Sale';
		//         } else if (log.indexOf("NFT sold for") != -1) {
		//             value = log.match(/\d+/)[0]
		//             console.log(value)
		//             break;
		//         } else {
		//             type = 'Misc'
		//         }
		//     }
		//     transactions.push({
		//         block_signed_at: tx.blockTime,
		//         tx_hash: signature,
		//         successful: true, // always true
		//         from_address: '?',
		//         to_address: '?',
		//         value,
		//         value_quote: null, // You'll have to get the price of solana when the block was signed. Might not be worth the effort
		//         fees,
		//         type,
		//     })
		// }
		// console.log(transactions)
		nfts[i].transactions = transactions;
		nfts[i].rank = ranksMap && mint in ranksMap && ranksMap[mint];
		// console.log(nfts[i].rank)
	}

	// Reorder array by rarity in ascending order - least rare to most rare
	nfts.sort(ascRarityComparator);

	// Analytics
	incrementCollectionViewCount(context.req.db, collection._id);
	return { props: { collection, nfts } };
}

// Compare 2 nfts by rarity
function ascRarityComparator(a, b) {
	if (!a.metadata["rarity"] || !b.metadata["rarity"]) return 0;
	if (a.metadata.rarity < b.metadata.rarity) return -1;
	else if (a.metadata.rarity > b.metadata.rarity) return 1;
	else return 0;
}
