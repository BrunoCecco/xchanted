export async function findNftsUnderCollection(db, collectionId, verifiedCollectionsOnly = true) {
    return await db.collection('nfts').aggregate([
        (verifiedCollectionsOnly ? { $match: { "rank": { $exists: true, $ne: null } } } : {}),
        { $match: { "_id": { $regex: collectionId } } }
    ])
}

export async function findNftsUnderCollections(db, collectionIds, limitNfts, verifiedCollectionsOnly = true) {
    return await db.collection('nfts').aggregate([
        (verifiedCollectionsOnly ? { $match: { "rank": { $exists: true, $ne: null } } } : {}),
        { $match: { "_id": { $in: collectionIds.map(cId => RegExp(cId)) } } },
        { $sample: { size: limitNfts } }
    ])
}

export async function findNftsByIds(db, nftIds, limitNftsFromFollowingUsersCollections = 5) {
    return await db.collection('nfts').aggregate([
        { $match: { "_id": { $in: nftIds } } },
        { $sample: { size: limitNftsFromFollowingUsersCollections } }
    ])
}