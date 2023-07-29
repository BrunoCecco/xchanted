import { ObjectId } from "mongodb";
import _ from "lodash";
import { dbProjectionNfts } from "./search";

export async function findCollectionById(db, collectionId) {
	return db
		.collection("collections")
		.findOne({ _id: collectionId })
		.then((col) => col || null);
}

export async function findCollectionsBySlugEth(db, ethSlug) {
	return db
		.collection("collections")
		.findOne({ slug: ethSlug })
		.then((col) => col || null);
}

export async function findCollectionsBySlugSol(db, solSlug) {
	return db
		.collection("collections")
		.findOne({ slug: solSlug })
		.then((col) => col || null);
}

export async function findCollectionsByIds(db, collectionIds) {
	return db.collection("collections").aggregate([
		{ $match: { _id: { $in: collectionIds } } },
		{
			$project: {
				name: 1,
				image_url: 1,
				slug: 1,
			},
		},
	]);
}

export async function findNfts(db, collectionId, userId) {
	return await db.collection("nfts").aggregate([
		{ $match: { _id: { $regex: collectionId } } },
		{
			$project: {
				chain: 1,
				metadata: 1,
				name: 1,
				symbol: 1,
				appreciatesNum: {
					$cond: {
						if: { $ne: [{ $type: "$appreciates" }, "missing"] },
						then: { $size: "$appreciates" },
						else: 0,
					},
				},
				userAppreciated: {
					$cond: {
						if: { $ne: [{ $type: "$appreciates" }, "missing"] },
						then: { $in: [new ObjectId(userId), "$appreciates"] },
						else: false,
					},
				},
			},
		},
	]);
}

export async function findSolNftsByUpdateAuth(db, updateAuth, userId) {
	return await db.collection("nfts").aggregate([
		{ $match: { "metadata.updateAuth": { $regex: updateAuth } } },
		{
			$project: {
				chain: 1,
				metadata: 1,
				name: 1,
				symbol: 1,
				appreciatesNum: {
					$cond: {
						if: { $ne: [{ $type: "$appreciates" }, "missing"] },
						then: { $size: "$appreciates" },
						else: 0,
					},
				},
				userAppreciated: {
					$cond: {
						if: { $ne: [{ $type: "$appreciates" }, "missing"] },
						then: { $in: [new ObjectId(userId), "$appreciates"] },
						else: false,
					},
				},
			},
		},
	]);
}

export async function findNftsWithOwners(db, collectionId, userId, skip) {
	return await db.collection("nfts").aggregate([
		{ $match: { _id: { $regex: collectionId } } },
		{ $sort: { rank: 1 } },
		{
			$facet: {
				metadata: [{ $count: "total" }],
				data: [
					{ $skip: skip },
					{ $limit: 10 },
					{
						$project: {
							chain: 1,
							metadata: 1,
							name: 1,
							symbol: 1,
							rank: 1,
							appreciatesNum: {
								$cond: {
									if: {
										$ne: [
											{ $type: "$appreciates" },
											"missing",
										],
									},
									then: { $size: "$appreciates" },
									else: 0,
								},
							},
							userAppreciated: {
								$cond: {
									if: {
										$ne: [
											{ $type: "$appreciates" },
											"missing",
										],
									},
									then: {
										$in: [
											new ObjectId(userId),
											"$appreciates",
										],
									},
									else: false,
								},
							},
						},
					},
					{
						$lookup: {
							from: "users",
							localField: "_id",
							foreignField: "nfts",
							as: "owner",
							pipeline: [
								{
									$project: {
										name: 1,
										username: 1,
										usernameNFT: 1,
										profilePicture: 1,
										banner: 1,
										selectedCollections: 1,
									},
								},
							],
						},
					},
				],
			},
		},
	]);
}

export async function findCollectionRecommendations(db, collectionId) {
	return db
		.collection("collections")
		.findOne({ _id: collectionId }, { $project: { recommendations: 1 } })
		.then((col) =>
			col && "recommendations" in col ? col.recommendations : null
		);
}

// Making an assumption that nfts with ranks come from verified collections
export async function getRandomNFTs(db, numNfts, verifiedCollectionsOnly = false) {
	let nfts = await db.collection("nfts").aggregate([
		(verifiedCollectionsOnly ? { $match: { "rank": { $exists: true, $ne: null } } } : null),
		{
			$sample: { size: numNfts },
		},
		{ $project: dbProjectionNfts() },
	].filter(e => e));
	nfts = await nfts.toArray();
	return nfts;
}

export async function getRandomCollections(db, numCollections, verifiedCollectionsOnly = false) {
	let collections = await db.collection("collections").aggregate([
		(verifiedCollectionsOnly ? { $match: { "safelist_request_status": { $exists: true, $eq: "verified" } } } : {}),
		{
			$sample: { size: numCollections },
		},
		{ $project: dbProjectionCollections() }
	]);
	collections = await collections.toArray();
	return collections;
}

export async function findRecommendedNfts(db, nftId, numNfts) {
	const collectionId = nftId.split("-")[0]; // TODO: handle exceptions
	let recommendedNfts = [];
	let recommendedCollections = await findCollectionRecommendations(
		db,
		collectionId
	);

	if (!recommendedCollections || !("owners" in recommendedCollections)) {
		console.log("No recommendations found");
		console.log(`getting ${numNfts - recommendedNfts.length} random nfts`);
		recommendedNfts = recommendedNfts.concat(
			await getRandomNFTs(db, numNfts - recommendedNfts.length, true)
		);
		return recommendedNfts;
	}

	recommendedCollections = recommendedCollections.owners; // Recommendations based on other collection owners
	let totalUsers = 0; // Users who own all the recommended Collections (for weighting)
	for (let i = 0; i < recommendedCollections.length; i++) {
		totalUsers += recommendedCollections[i]["numOwners"]; // Note: This might get fewer nfts than expected which is fine since we'll have random nfts to fill in the gaps
	}

	// Loop through recommended collections and get recommended nfts by taking a sample
	for (let i = 0; i < recommendedCollections.length; i++) {
		if (recommendedNfts.length > numNfts) break;
		if (!recommendedCollections[i]) continue;
		let nftIds = _.sampleSize(
			recommendedCollections[i]["nftIds"],
			(numNfts * recommendedCollections[i]["numOwners"]) / totalUsers
		);
		let nfts = await db.collection("nfts").find({ _id: { $in: nftIds } });
		nfts = await nfts.toArray();
		recommendedNfts = recommendedNfts.concat(nfts);
	}

	// Fetch random nfts if we don't have enough
	if (recommendedNfts.length < numNfts) {
		console.log(`getting ${numNfts - recommendedNfts.length} random nfts`);
		recommendedNfts = recommendedNfts.concat(
			await getRandomNFTs(db, numNfts - recommendedNfts.length, true)
		);
	}

	// shuffle the nft array
	recommendedNfts = _.shuffle(recommendedNfts);
	return recommendedNfts;
}

export function dbProjectionCollections(prefix = "") {
	return {
		[`${prefix}ranksMap`]: 0,
		[`${prefix}recommendations`]: 0,
		[`${prefix}traits`]: 0,
	};
}

export async function updateCollectionByIdPush(db, id, data) {
	return db
		.collection("collections")
		.findOneAndUpdate(
			{ _id: id },
			{ $addToSet: data },
			{ returnDocument: "after", projection: dbProjectionCollections() }
		)
		.then(({ value }) => value);
}

export async function updateCollectionByIdPull(db, id, data) {
	return db
		.collection("collections")
		.findOneAndUpdate(
			{ _id: id },
			{ $pull: data },
			{ returnDocument: "after", projection: dbProjectionCollections() }
		)
		.then(({ value }) => value);
}
