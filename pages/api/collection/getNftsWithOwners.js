import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import { findNftsWithOwners } from "../../../api-lib/db/collection";
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

//get user info
handler.post(
	validateBody({
		type: "object",
		properties: {
			collectionId: { type: "string" },
			collectionTraits: { type: "object" },
			skip: { type: "number" },
		},
		required: ["collectionId", "skip"],
		additionalProperties: false,
	}),
	async (req, res) => {
		const nftsCursor = await findNftsWithOwners(
			req.db,
			req.body.collectionId,
			req.user ? req.user._id : null,
			req.body.skip
		);
		var nfts = (await nftsCursor.toArray()) || [];
		nfts = nfts[0].data;

		for (let i = 0; i < nfts.length; i++) {
			const traits = nfts[i]?.metadata?.traits;
			let probabilityOfNftTraits = 1;
			let score = 0;
			if (!traits && !Array.isArray(traits)) continue; // Skip if no traits or invalid traits
			if (!req.body.collectionTraits || !traits) break;
			for (const trait of traits) {
				if (
					trait &&
					req.body.collectionTraits &&
					"trait_type" in trait &&
					trait?.trait_type in req.body.collectionTraits &&
					"value" in trait &&
					trait?.value?.toString().toLowerCase() in
						req.body.collectionTraits[trait.trait_type]
				) {
					let nftsWithTrait =
						req.body.collectionTraits[trait.trait_type][
							trait.value.toString().toLowerCase()
						]; // Number
					let sum = 0; // All nfts with this type of trait
					for (const k in req.body.collectionTraits[
						trait.trait_type
					]) {
						sum += req.body.collectionTraits[trait.trait_type][k];
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
		}

		// Reorder array by rarity in ascending order - least rare to most rare
		if (!nfts[0]?.metadata?.rank) {
			//nfts.sort(ascRarityComparator);
		}
		console.log("hmmms");

		return res.json(nfts);
	}
);

export default handler;

// Compare 2 nfts by rarity
function ascRarityComparator(a, b) {
	if (!a.metadata["rarity"] || !b.metadata["rarity"]) return 0;
	if (a.metadata.rarity < b.metadata.rarity) return -1;
	else if (a.metadata.rarity > b.metadata.rarity) return 1;
	else return 0;
}
