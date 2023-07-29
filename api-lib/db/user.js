import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import normalizeEmail from "validator/lib/normalizeEmail";

export async function getAllUsersMinified(db) {
	return db.collection("users").find({});
}

export async function findUserWithEmailAndPassword(db, email, password) {
	email = normalizeEmail(email);
	const user = await db.collection("users").findOne(
		{ email },
		{
			projection: {
				followers: 0,
				following: 0,
				followingCollections: 0,
			},
		}
	);
	if (user && (await bcrypt.compare(password, user.password))) {
		return { ...user, password: undefined }; // filtered out password
	}
	return null;
}

export async function findUserByUauth(db, dns) {
	const user = await db.collection("users").findOne(
		{ uauth: dns },
		{
			projection: {
				password: 0,
				followers: 0,
				following: 0,
				followingCollections: 0,
			},
		}
	);
	return user;
}

export async function findUserForAuth(db, userId) {
	return db
		.collection("users")
		.findOne(
			{ _id: new ObjectId(userId) },
			{
				projection: {
					password: 0,
					followers: 0,
					following: 0,
					followingCollections: 0,
				},
			}
		)
		.then((user) => user || null);
}

export async function findUserById(db, userId) {
	return db
		.collection("users")
		.findOne(
			{ _id: new ObjectId(userId) },
			{ projection: dbProjectionUsers() }
		)
		.then((user) => user || null);
}

export async function findUserByUsername(db, username) {
	return db
		.collection("users")
		.findOne(
			{ username },
			{
				projection: {
					email: 0,
					password: 0,
					emailVerified: 0,
				},
			}
		)
		.then((user) => user || null);
}

export async function findUserByUsernameAgg(db, username, requesterId) {
	return await db.collection("users").aggregate([
		{ $match: { username: username } },
		{
			$project: {
				nfts: 1,
				username: 1,
				usernameNFT: 1,
				selected: 1,
				name: 1,
				banner: 1,
				profilePicture: 1,
				bio: 1,
				website: 1,
				tagged: 1,
				bannerDescription: 1,
				bannerNFT: 1,
				bannerTitle: 1,
				selectedCollections: 1,
				hiddenCollections: 1,
				collectionsOrder: 1,
				ethereum: 1,
				followers: {
					$cond: {
						if: { $ne: [{ $type: "$followers" }, "missing"] },
						then: { $size: "$followers" },
						else: 0,
					},
				},
				following: {
					$cond: {
						if: { $ne: [{ $type: "$following" }, "missing"] },
						then: { $size: "$following" },
						else: 0,
					},
				},
				requesterFollowingThisUser: {
					$cond: {
						if: { $ne: [{ $type: "$followers" }, "missing"] },
						then: {
							$in: [new ObjectId(requesterId), "$followers"],
						},
						else: false,
					},
				},
			},
		},
	]);
}

export async function findFollowByIds(db, accIds, limit, requesterId) {
	return await db.collection("users").aggregate([
		{ $match: { _id: { $in: accIds } } },
		{ $limit: limit },
		{ $sort: { _id: -1 } },
		{
			$project: {
				profilePicture: 1,
				username: 1,
				usernameNFT: 1,
				name: 1,
				bio: 1,
				selectedCollections: 1,
				requesterFollowingThisUser: {
					$cond: {
						if: { $ne: [{ $type: "$followers" }, "missing"] },
						then: {
							$in: [new ObjectId(requesterId), "$followers"],
						},
						else: false,
					},
				},
				requesterIsFollowedByUser: {
					$cond: {
						if: { $ne: [{ $type: "$following" }, "missing"] },
						then: {
							$in: [new ObjectId(requesterId), "$following"],
						},
						else: false,
					},
				},
			},
		},
	]);
}

export async function findUserByEmail(db, email) {
	email = normalizeEmail(email);
	return db
		.collection("users")
		.findOne({ email }, { projection: dbProjectionUsers() })
		.then((user) => user || null);
}

export async function updateUserById(db, id, data) {
	return db
		.collection("users")
		.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: data },
			{
				returnDocument: "after",
				projection: {
					password: 0,
					nonce: 0,
					followers: 0,
					following: 0,
					chatHist: 0,
				},
			}
		)
		.then(({ value }) => value);
}

export async function updateUserByIdPush(db, id, data) {
	return db
		.collection("users")
		.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $addToSet: data },
			{ returnDocument: "after", projection: dbProjectionUsers() }
		)
		.then(({ value }) => value);
}

export async function updateUserByIdPull(db, id, data) {
	return db
		.collection("users")
		.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $pull: data },
			{ returnDocument: "after", projection: dbProjectionUsers() }
		)
		.then(({ value }) => value);
}

export async function insertUser(
	db,
	{
		email,
		originalPassword,
		uauth,
		bio = "",
		name,
		createdAt = new Date(),
		profilePicture = null,
		username,
		selected = [],
		followers = [],
		following = [],
		chatHist = [],
		nfts = [],
		ethereum = [],
		permissions = {
			chats: 1,
			chants: 1,
			comments: 1,
			chatCol: [],
			chantCol: [],
			commentCol: [],
		},
	}
) {
	const user = {
		emailVerified: false,
		profilePicture,
		email,
		name,
		following,
		followers,
		nfts,
		username,
		bio,
		selected,
		chatHist,
		createdAt,
		permissions,
		ethereum,
		solana: [],
	};
	if (originalPassword) {
		user.password = await bcrypt.hash(originalPassword, 10);
	}
	if (uauth) {
		user.uauth = uauth;
	}
	const { insertedId } = await db.collection("users").insertOne(user);
	user._id = insertedId;
	return user;
}

export async function updateUserPasswordByOldPassword(
	db,
	id,
	oldPassword,
	newPassword
) {
	const user = await db.collection("users").findOne(new ObjectId(id));
	if (!user) return false;
	const matched = await bcrypt.compare(oldPassword, user.password);
	if (!matched) return false;
	const password = await bcrypt.hash(newPassword, 10);
	await db
		.collection("users")
		.updateOne({ _id: new ObjectId(id) }, { $set: { password } });
	return true;
}

export async function UNSAFE_updateUserPassword(db, id, newPassword) {
	const password = await bcrypt.hash(newPassword, 10);
	await db
		.collection("users")
		.updateOne({ _id: new ObjectId(id) }, { $set: { password } });
}

export function dbProjectionUsers(prefix = "") {
	return {
		[`${prefix}password`]: 0,
		[`${prefix}email`]: 0,
		[`${prefix}emailVerified`]: 0,
		[`${prefix}chatHist`]: 0,
		[`${prefix}createdAt`]: 0,
		[`${prefix}permissions`]: 0,
		[`${prefix}lastReads`]: 0,
	};
}

export async function bulkUpdateNfts(db, dataArray) {
	return await db.collection("nfts").bulkWrite(
		dataArray.map((each) => ({
			updateOne: {
				filter: { _id: each._id },
				update: {
					$set: {
						metadata: each.metadata,
						chain: each.chain,
						name: each.name,
						symbol: each.symbol,
					},
				},
				upsert: true,
			},
		}))
	);
}

export async function updateUserCollection(db, userId, nftIds) {
	return db
		.collection("users")
		.findOneAndUpdate(
			{ _id: new ObjectId(userId) },
			{
				$set: {
					nfts: nftIds,
				},
			},
			{ returnDocument: "after", projection: { password: 0 } }
		)
		.then(({ value }) => value);
}

export async function setBannerUrl(db, userId, url) {
	return db.collection("users").findOneAndUpdate(
		{ _id: new ObjectId(userId) },
		{
			$set: {
				banner: url,
			},
		},
		{ returnDocument: "after", projection: { password: 0 } }
	);
}

export async function checkIfAddrRegistered(db, chain, addr) {
	return db
		.collection("users")
		.find(
			{
				[chain]: {
					$elemMatch: { address: addr },
				},
			},
			{ returnDocument: "after", projection: { _id: 1 } }
		)
		.limit(1);
}

export async function findAllPoapHolders(db, poapId, requesterId) {
	return db.collection("users").find(
		{
			poaps: {
				$elemMatch: { "event.id": Number(poapId) },
			},
		},
		{
			$project: {
				profilePicture: 1,
				username: 1,
				usernameNFT: 1,
				name: 1,
				bio: 1,
				selectedCollections: 1,
				requesterFollowingThisUser: {
					$cond: {
						if: { $ne: [{ $type: "$followers" }, "missing"] },
						then: {
							$in: [new ObjectId(requesterId), "$followers"],
						},
						else: false,
					},
				},
				requesterIsFollowedByUser: {
					$cond: {
						if: { $ne: [{ $type: "$following" }, "missing"] },
						then: {
							$in: [new ObjectId(requesterId), "$following"],
						},
						else: false,
					},
				},
			},
		}
	);
}

export async function setPoaps(db, userId, poaps) {
	return db
		.collection("users")
		.findOneAndUpdate(
			{ _id: new ObjectId(userId) },
			{
				$set: {
					poaps: poaps,
				},
			},
			{ returnDocument: "after", projection: { password: 0 } }
		)
		.then(({ value }) => value);
}

//NFTS

export async function findNfts(db, idArr, userId) {
	return await db.collection("nfts").aggregate([
		{ $match: { _id: { $in: idArr } } },
		{
			$project: {
				chain: 1,
				metadata: 1,
				name: 1,
				symbol: 1,
				rank: 1,
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

export async function findNftWithOwner(db, idArr, userId) {
	return await db.collection("nfts").aggregate([
		{ $match: { _id: { $in: idArr } } },
		{
			$project: {
				chain: 1,
				metadata: 1,
				name: 1,
				symbol: 1,
				rank: 1,
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
	]);
}

export async function findTezosAndUpdate(db, id, link) {
	return db
		.collection("nfts")
		.findOneAndUpdate(
			{
				$and: [
					{ _id: id },
					{
						$or: [
							{ "metadata.imgopti": { $exists: false } },
							{ "metadata.imgopti": null },
						],
					},
				],
			},
			{
				$set: { "metadata.imgopti": link },
			},
			{ returnDocument: "after", projection: { password: 0 } }
		)
		.then(({ value }) => value);
}
