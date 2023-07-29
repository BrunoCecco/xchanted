import { ObjectId } from "mongodb";
import { dbProjectionUsers } from "./user";

// Setters for analytics
// Apologies for the long function names

// NFT
// view count

export async function incrementNftViewCount(db, nftId) {
    return db.collection("nfts").updateOne(
        { _id: nftId },
        { $inc: { "views.hr": 1, "views.day": 1, "views.week": 1, "views.allTime": 1 } },
        { upsert: true }
    );
}

// durationKey = "day", "hr", "week", "allTime"
export async function resetAllNftsViewCount(db, durationKey = "hr") {
    if (durationKey === "allTime") throw Error("Cannot reset all time view count");
    return db.collection("nfts").aggregate(
        [
            { $match: {} },
            { $addFields: { [`views.${durationKey}Prev`]: { "$ifNull": [[`views.${durationKey}`], 0] } } },
            { $set: { [`views.${durationKey}`]: 0, } },
        ]
    )
}

export async function changeNFTAppreciateCount(db, nftId, increase = true) {
    let change = increase ? 1 : -1;
    return db.collection("nfts").updateOne(
        { _id: nftId },
        { $inc: { "followerChange.hr": change, "followerChange.day": change, "followerChange.week": change, "followerChange.allTime": change } },
        { upsert: true }
    );
}

export async function resetAllNFTAppreciateChange(db, durationKey = "hr") {
    if (durationKey === "allTime") throw Error("Cannot reset all time view count");
    return db.collection("nfts").aggregate(
        [
            { $match: {} },
            { $set: { [`followerChange.${durationKey}`]: 0, } },
        ]
    )
}

// User
// view count, follower count

export async function incrementUserViewCount(db, userId) {
    return db.collection("users").updateOne(
        { _id: ObjectId(userId) },
        { $inc: { "views.hr": 1, "views.day": 1, "views.week": 1, "views.allTime": 1 } },
        { upsert: true }
    );
}

export async function resetAllUsersViewCount(db, durationKey = "hr") {
    if (durationKey === "allTime") throw Error("Cannot reset all time view count");
    return db.collection("users").aggregate(
        [
            { $match: {} },
            { $addFields: { [`views.${durationKey}Prev`]: { "$ifNull": [[`views.${durationKey}`], 0] } } },
            { $set: { [`views.${durationKey}`]: 0, } },
        ]
    )
}

export async function changeUserFollowCount(db, userId, increase = true) {
    let change = increase ? 1 : -1;
    return db.collection("users").updateOne(
        { _id: ObjectId(userId) },
        { $inc: { "followerChange.hr": change, "followerChange.day": change, "followerChange.week": change, "followerChange.allTime": change } },
        { upsert: true }
    );
}

export async function resetAllUsersFollowerChange(db, durationKey = "hr") {
    if (durationKey === "allTime") throw Error("Cannot reset all time view count");
    return db.collection("users").aggregate(
        [
            { $match: {} },
            { $set: { [`followerChange.${durationKey}`]: 0, } },
        ]
    )
}

// Collection
// view count, follower count

export async function incrementCollectionViewCount(db, collectionId) {
    return db.collection("collections").updateOne(
        { _id: collectionId },
        { $inc: { "views.allTime": 1, "views.day": 1, "views.hr": 1 } },
        { upsert: true }
    );
}

export async function resetAllCollectionsViewCount(db, durationKey = "hr") {
    if (durationKey === "allTime") throw Error("Cannot reset all time view count");
    return db.collection("collections").aggregate(
        [
            { $match: {} },
            { $addFields: { [`views.${durationKey}Prev`]: { "$ifNull": [[`views.${durationKey}`], 0] } } },
            { $set: { [`views.${durationKey}`]: 0, } },
        ]
    )
}

export async function changeCollectionFollowCount(db, collectionId, increase = true) {
    let change = increase ? 1 : -1;
    return db.collection("collections").updateOne(
        { _id: collectionId },
        { $inc: { "followerChange.hr": change, "followerChange.day": change, "followerChange.week": change, "followerChange.allTime": change } },
        { upsert: true }
    );
}

export async function resetAllCollectionsFollowerChange(db, durationKey = "hr") {
    if (durationKey === "allTime") throw Error("Cannot reset all time view count");
    return db.collection("collections").aggregate(
        [
            { $match: {} },
            { $set: { [`followerChange.${durationKey}`]: 0, } },
        ]
    )
}

// Possibility: Get new NFTs/Collections listed in the past 24 hr window - we'll need the created at date

// Queries/Getter functions for analytics

// NFT

export async function getNftsByAllTimeViewCount(db, limit, skip, chain, sort) {
    let filter = {}
    if (chain >= 0) {
        filter = { chain: chain }
    } else filter = {}

    return db
        .collection("nfts")
        .aggregate(
            [
                { $match: filter },
                { $addFields: { "appreciatesCount": { $size: { "$ifNull": ["$appreciates", []] } } } },
                { $sort: { "views.allTime": sort } },
                { $skip: skip },
                { $limit: limit },
            ]
        )
}
export async function getNftsByHighestAppreciates(db, limit, skip, chain, sort) {
    let filter = {}
    if (chain >= 0) {
        filter = { chain: chain }
    } else filter = {}

    return db
        .collection("nfts")
        .aggregate(
            [
                { $match: filter },
                { $addFields: { "appreciatesCount": { $size: { "$ifNull": ["$appreciates", []] } } } },
                { $sort: { "appreciatesCount": sort } },
                { $skip: skip },
                { $limit: limit },
            ]
        )
}

// Collections

// TODO: clean up
export function dbProjectionCollections(prefix = "") {
    return {
        [`${prefix}ranksMap`]: 0,
        [`${prefix}recommendations`]: 0,
        [`${prefix}traits`]: 0,
    };
}

export async function getCollectionsByAllTimeViewCount(db, limit, skip = 0, chain = null, sort = -1, sample = false, sampleCnt = 10) {
    let filter = {}
    if (chain == 0) {
        filter = { $or: [{ "schema_name": "ERC721" }, { "schema_name": "ERC1155" }] }
    }
    else if (chain == 1)
        filter = { "schema_name": "SOLANA" }
    else filter = {}

    return db
        .collection("collections")
        .aggregate(
            [
                { $match: filter },
                { $addFields: { "followersCount": { $size: { "$ifNull": ["$followers", []] } } } },
                { $sort: { "views.allTime": sort } },
                { $skip: skip },
                { $limit: limit },
                (sample) ? { $sample: { size: sampleCnt } } : null,
                { $project: dbProjectionCollections() },
            ].filter(e => e != null)
        )
}

export async function getCollectionsByFollowersCount(db, limit, skip, chain, sort) {
    let filter = {}
    if (chain == 0) {
        filter = { $or: [{ "schema_name": "ERC721" }, { "schema_name": "ERC1155" }] }
    }
    else if (chain == 1)
        filter = { "schema_name": "SOLANA" }
    else filter = {}

    return db
        .collection("collections")
        .aggregate(
            [
                { $match: filter },
                { $addFields: { "followersCount": { $size: { "$ifNull": ["$followers", []] } } } },
                { $sort: { "followersCount": sort } },
                { $skip: skip },
                { $limit: limit },
                { $project: dbProjectionCollections() },
            ]
        )
}

// Could get collections based on: #holder, floor price, floor price change, trading volume, trading volume change, etc.

// User

export async function getUsersByAllTimeViewCount(db, limit, skip, sort) {
    return db
        .collection("users")
        .aggregate(
            [
                { $addFields: { "followersCount": { $size: { "$ifNull": ["$followers", []] } } } },
                { $addFields: { "nftCount": { $size: { "$ifNull": ["$nfts", []] } } } },
                { $sort: { "views.allTime": sort } },
                { $skip: skip },
                { $limit: limit },
                { $project: dbProjectionUsers() },
            ]
        )
}

export async function getUsersByFollowersCount(db, limit = 10, skip, sort) {
    return db
        .collection("users")
        .aggregate(
            [
                { $addFields: { "followersCount": { $size: { "$ifNull": ["$followers", []] } } } },
                { $addFields: { "nftCount": { $size: { "$ifNull": ["$nfts", []] } } } },
                { $sort: { "followersCount": sort } },
                { $skip: skip },
                { $limit: limit },
                { $project: dbProjectionUsers() },
            ]
        )
}

export async function getUsersByNftCount(db, limit = 10, skip, sort) {
    return db
        .collection("users")
        .aggregate(
            [
                { $addFields: { "followersCount": { $size: { "$ifNull": ["$followers", []] } } } },
                { $addFields: { "nftCount": { $size: { "$ifNull": ["$nfts", []] } } } },
                { $sort: { "nftCount": sort } },
                { $skip: skip },
                { $limit: limit },
                { $project: dbProjectionUsers() },
            ]
        )
}

// TODO: Create search indexes to speed this up