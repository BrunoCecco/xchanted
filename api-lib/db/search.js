// Search user

import { dbProjectionUsers } from "./user";

export async function searchUsers(db, query, limit = 4) {
    return db.collection('users').aggregate([{
        $search: {
            "index": "Test",
            "autocomplete": {
                "query": query,
                "path": "username",
                "fuzzy": {
                    "maxEdits": 2,
                    "prefixLength": 3
                }
            }
        }
    },
    { $limit: limit },
    {
        $project: dbProjectionUsers()
    }])
}

// Search NFT

export async function searchNfts(db, query, limit = 4) {
    return db.collection('nfts').aggregate([{
        $search: {
            "index": "NFT Search Index",
            "autocomplete": {
                "query": query,
                "path": "metadata.name",
                "fuzzy": {
                    "maxEdits": 2,
                    "prefixLength": 3
                }
            }
        }
    },
    { $limit: limit },
    {
        $project: dbProjectionNfts()
    }
    ])
}

// Search Collection

export async function searchCollections(db, query, limit = 4) {
    return db.collection('collections').aggregate([{
        $search: {
            "index": "Collections Search Index",
            "autocomplete": {
                "query": query,
                "path": "name",
                "fuzzy": {
                    "maxEdits": 2,
                    "prefixLength": 3
                }
            }
        }
    },
    { $sort: { "stats.floor_price": -1, "stats.num_owners": -1, "stats.average_price": -1, "views.allTime": -1 } },
    { $limit: limit },
    {
        $project: dbProjectionCollections()
    }])
}

export function dbProjectionCollections(prefix = "") {
	return {
		[`${prefix}ranksMap`]: 0,
		[`${prefix}recommendations`]: 0,
		[`${prefix}traits`]: 0,
	};
}

export function dbProjectionNfts(prefix = "") {
	return {
		[`${prefix}metadata.traits`]: 0,
	};
}

//search chats
export async function searchChats(db, query, limit = 4) {
    return db.collection('conversations').aggregate([{
        $search: {
            "index": "Chats Search Index",
            "autocomplete": {
                "query": query,
                "path": "name",
                "fuzzy": {
                    "maxEdits": 2,
                    "prefixLength": 3
                }
            }
        }
    },
    { $limit: limit },
    {
        $project: dbProjectionChats()
    }
    ])
}

export function dbProjectionChats(prefix = "") {
	return {
		[`${prefix}latestMessage`]: 0,
		[`${prefix}latestMessageSender`]: 0,
	};
}