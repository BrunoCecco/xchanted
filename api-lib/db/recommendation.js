import { findNftsByIds, findNftsUnderCollections } from "./nfts";
import { dbProjectionCollections } from "./search";
import { findCollectionsByIds, getRandomCollections, getRandomNFTs } from "../../api-lib/db/collection";
import { getCollectionsByAllTimeViewCount, getUsersByAllTimeViewCount } from "./analytics";
import { dbProjectionUsers } from "./user";
import { ObjectId } from "mongodb";


// TODO: Clean up this function
// Speedup: https://stackoverflow.com/questions/48932558/can-i-batch-aggregations-in-mongodb

export async function findNFTRecommendations(db, user, collectionIds = null, limitCollections = 20, limitNfts = 20, nftsPerCollection = 2, offset = 0, limitNftsFromSimilarCollectionsToUser = 6, limitNftsFromFollowedCollections = 3, limitNftsFromTrendingCollections = 3, limitNftsFromFollowingUsersCollections = 5) {
    console.time('findNFTRecommendations');
    let nfts = []
    let candidateCollectionsIds = []

    // based on user's collections - collections similarity
    if (user && user.nfts && user.nfts.length > 0) {
        if (!collectionIds || collectionIds.length == 0) {
            collectionIds = new Set(user.nfts.map(nftId => nftId.split('-')[0]))
        }

        const similarCollections = await (await db.collection('collection-similarities')
            .aggregate([
                {
                    $match: {
                        c1Id: { $in: Array.from(collectionIds) },
                        c2Id: { $in: Array.from(collectionIds) }
                    }
                },
                { $sort: { "userBased.userIntersectionPercentage": -1, "activityBased.numOwnersDiff": 1, "activityBased.avgPriceDiff": 1 } },
                // { $skip: offset },
                { $limit: limitCollections },
                { $sample: { size: limitCollections } },
                {
                    $project: dbProjectionCollections()
                }])).toArray()
        // console.log(similarCollections.length)

        const cIds = []
        for (const collectionPair of similarCollections) {
            if (!(collectionPair.c1Id in collectionIds)) {
                cIds.push(collectionPair.c1Id)
            }
            if (!(collectionPair.c2Id in collectionIds)) {
                cIds.push(collectionPair.c2Id)
            }
            if (nfts.length > limitNfts) {
                break
            }
        }

        candidateCollectionsIds = cIds
        console.log(`${candidateCollectionsIds.length} similar collections found based on user's collections`)
        let nftsFromSimilarCollectionsToUser = (await (await findNftsUnderCollections(db, cIds, limitNftsFromSimilarCollectionsToUser)).toArray())
        nftsFromSimilarCollectionsToUser.forEach(e => e.explainer = "similar to user's collections")
        nfts = nfts.concat(nftsFromSimilarCollectionsToUser)
    }

    // based on collections owned by user's friends - collections similarity
    if (user && user.following && user.following.length > 0) {
        let followingUsersNftIds = [];
        const followingUsersSample = await (await db.collection('users').aggregate([
            { $match: { _id: { $in: user.following } } },
            { $sample: { size: limitNftsFromFollowingUsersCollections } },
            { $project: dbProjectionUsers() }
        ])).toArray()
        for (const user of followingUsersSample) {
            if (user.nfts && user.nfts.length > 0) {
                followingUsersNftIds = followingUsersNftIds.concat(user.nfts)
            }
        }
        console.log(`${followingUsersNftIds.length} nfts owned by user's friends/following`)
        const followingUsersNfts = await (await findNftsByIds(db, followingUsersNftIds, limitNftsFromFollowingUsersCollections)).toArray()
        followingUsersNfts.forEach(e => e.explainer = `owned by user's following`)

        console.log(`recommending ${followingUsersNfts.length} nfts owned by user's friends/following`)
        nfts = nfts.concat(followingUsersNfts)
    }

    // based on collections that user follows
    if (user && user.followingCollections && user.followingCollections.length > 0) {
        const cIds2 = []
        for (const collectionId of user.followingCollections) {
            if (!(collectionId in candidateCollectionsIds)) {
                cIds2.push(collectionId)
            }
        }
        candidateCollectionsIds = candidateCollectionsIds.concat(cIds2)
        console.log(`${cIds2.length} collections found based on user's following collections`)
        let nftsFromFollowedCollections = (await (await findNftsUnderCollections(db, cIds2, limitNftsFromFollowedCollections)).toArray())
        nftsFromFollowedCollections.forEach(nft => nft['explainer'] = "user's follows this collection")
        nfts = nfts.concat(nftsFromFollowedCollections)
    }

    // based on trending
    const collectionsByViewCount = await (await getCollectionsByAllTimeViewCount(db, limitCollections, 0, null, -1)).toArray();
    let nftsFromTrendingCollections = (await (await findNftsUnderCollections(db, collectionsByViewCount.map(c => c._id), limitNftsFromTrendingCollections)).toArray())
    nftsFromTrendingCollections.forEach(nft => nft['explainer'] = "trending")
    nfts = nfts.concat(nftsFromTrendingCollections)


    // Fetch Nfts from candidate collections
    // nfts = await (await findNftsUnderCollections(db, candidateCollectionsIds, limitNfts)).toArray()

    // based on random selection
    if (nfts.length < limitNfts) {
        let randomNfts = (await getRandomNFTs(db, limitNfts - nfts.length, true));
        randomNfts.forEach(nft => nft['explainer'] = "random")
        nfts = nfts.concat(randomNfts)
        console.log(`${randomNfts.length} random NFTs fetched`)
    }

    // console.log(nfts)
    // remove duplicates
    nfts = nfts.filter((nft, index, self) => self.findIndex(nft2 => nft2._id === nft._id) === index)

    // Find users that own these NFTs
    const nftIds = nfts.map(nft => nft._id)
    const nftOwners = await (await db.collection('users').aggregate([
        { $match: { nfts: { $in: nftIds } } },
    ])).toArray()
    console.log(`${nftOwners.length} users found that own these NFTs`)
    
    // Find collections for these NFTs
    const selectedCIds = nfts.map(nft => nft._id.split('-')[0])
    const nftCollections = await (await findCollectionsByIds(db, selectedCIds)).toArray()
    
    nfts = nfts.map(nft => {
        nft.owner = nftOwners.find(owner => owner.nfts.includes(nft._id))
        nft.collection = nftCollections.find(collection => collection._id === nft._id.split('-')[0])
        return nft
    })
    
    // sort and limit
    nfts = nfts.sort(() => Math.random() - 0.5)
    nfts = nfts.slice(0, limitNfts)
    console.timeEnd('findNFTRecommendations');
    return nfts
}

export async function findCollectionRecommendations(db, user, collectionIds = null, limitCollections = 20, limitCollectionsSimilarToUser = 10, limitCollectionsFromTrendingCollections = 3, limitCollectionsFromFollowingUsersCollections = 5) {
    console.time('findCollectionRecommendations');
    let collections = []
    let candidateCollectionsIds = []

    // based on user's collections - collections similarity
    if (user && user.nfts && user.nfts.length > 0) {
        if (!collectionIds || collectionIds.length == 0) {
            collectionIds = Array.from(new Set([...(user.nfts?.map(nftId => nftId.split('-')[0])), ...(user.followingCollections ? user.followingCollections : [])])).filter(id => id)
        }

        const similarCollections = await (await db.collection('collection-similarities')
            .aggregate([
                {
                    $match: {
                        c1Id: { $in: Array.from(collectionIds) },
                        c2Id: { $in: Array.from(collectionIds) }
                    }
                },
                { $sort: { "userBased.userIntersectionPercentage": -1, "activityBased.numOwnersDiff": 1, "activityBased.avgPriceDiff": 1 } },
                { $limit: limitCollections },
                { $sample: { size: limitCollectionsSimilarToUser } },
                {
                    $project: dbProjectionCollections()
                }])).toArray()
        // console.log(similarCollections.length)

        const cIds = []
        for (const collectionPair of similarCollections) {
            if (!(collectionPair.c1Id in collectionIds)) {
                cIds.push(collectionPair.c1Id)
            }
            if (!(collectionPair.c2Id in collectionIds)) {
                cIds.push(collectionPair.c2Id)
            }
        }

        candidateCollectionsIds = cIds
        console.log(`${candidateCollectionsIds.length} similar collections found based on user's collections`)
    }

    // based on collections owned by user's friends - collections similarity
    if (user && user.following && user.following.length > 0) {
        let followingUsersCollectionIds = [];
        const followingUsersSample = await (await db.collection('users').aggregate([
            { $match: { _id: { $in: user.following } } },
            { $sample: { size: limitCollectionsFromFollowingUsersCollections } },
            { $project: dbProjectionUsers() }
        ])).toArray()
        for (const user of followingUsersSample) {
            if (user.nfts && user.nfts.length > 0) {
                followingUsersCollectionIds = followingUsersCollectionIds.concat(user.nfts)
            }
        }
        console.log(`${followingUsersCollectionIds.length} collections owned by user's friends/following`)
        candidateCollectionsIds = candidateCollectionsIds.concat(followingUsersCollectionIds)
    }

    console.log(collectionIds)
    const fetchedCollections = await (await findCollectionsByIds(db, candidateCollectionsIds, limitCollections)).toArray()
    fetchedCollections.forEach(e => e.explainer = `owned by user's following or similar to user's collections`)
    collections = collections.concat(fetchedCollections)

    // based on trending
    const collectionsByViewCount = await (await getCollectionsByAllTimeViewCount(db, limitCollections, 0, null, -1, true, limitCollectionsFromTrendingCollections)).toArray();
    collectionsByViewCount.forEach(e => e.explainer = `trending`)
    collections = collections.concat(collectionsByViewCount)

    // random
    if (collections.length < limitCollections) {
        let randomCollections = (await getRandomCollections(db, limitCollections - collections.length, true));
        randomCollections.forEach(collection => collection['explainer'] = "random")
        collections = collections.concat(randomCollections)
        console.log(`${randomCollections.length} random collections fetched`)
    }

    // sort and limit
    collections = collections.sort(() => Math.random() - 0.5)
    collections = collections.slice(0, limitCollections)
    console.timeEnd('findCollectionRecommendations');
    return collections;
}

// TODO: try recommend other users that have the same favourite collections (the 3 collections you choose)

export async function findUserRecommendations(db, user, limitUsers = 8) {
    let users = []
    // based on second degree followers - the people you follow also follow
    if (user && user.following && user.following.length > 0) {
        let secondDegreeFollowersUserIds = [];
        const followingUsersSample = await (await db.collection('users').aggregate([
            { $match: { _id: { $in: user.following } } },
            { $project: dbProjectionUsers() }
        ])).toArray()

        for (const u of followingUsersSample) {
            if (u.following && u.following.length > 0 && u._id != user._id) {
                secondDegreeFollowersUserIds = secondDegreeFollowersUserIds.concat(u.following)
            }
        }
        const uniqueSecondDegreeFollowersUserIds = [...new Set(secondDegreeFollowersUserIds)]
        console.log(`${uniqueSecondDegreeFollowersUserIds.length} second degree followers found`)
        const secondDegreeFollowers = await (await db.collection('users').aggregate([
            { $match: { _id: { $in: uniqueSecondDegreeFollowersUserIds.map(id => new ObjectId(id)) } } },
            { $sample: { size: limitUsers } },
            { $project: dbProjectionUsers() }
        ])).toArray()
        // secondDegreeFollowers.forEach(e => e.explainer = `second degree followers`)
        users = users.concat(secondDegreeFollowers)
    }

    // trending
    const usersByViewCount = await (await getUsersByAllTimeViewCount(db, limitUsers, 0, -1)).toArray();
    // usersByViewCount.forEach(e => e.explainer = `trending`)
    users = users.concat(usersByViewCount)

    // sort and limit
    users = users.sort(() => Math.random() - 0.5)
    users = users.filter((x, i, a) => a.indexOf(x) === i)
    users = users.slice(0, limitUsers)

    return users;
}