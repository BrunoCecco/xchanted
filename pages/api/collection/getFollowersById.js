import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import {
	findCollectionById,
	findCollectionsByIds,
} from "../../../api-lib/db/collection";
import { findUserById } from "../../../api-lib/db/user";
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post(
	validateBody({
		type: "object",
		properties: {
			collectionId: { type: "string" },
		},
		required: ["collectionId"],
		additionalProperties: false,
	}),
	async (req, res) => {
		const collection = await findCollectionById(
			req.db,
			req.body.collectionId
		);

		if (!collection) {
			return res.status(404).json({
				error: "Collection not found",
			});
		}

		var collectionFollowers = [];
		for (const follower of collection.followers) {
			const user = await findUserById(req.db, follower);
			if (user) {
				collectionFollowers.push(user);
			}
		}
		return res.json({ followers: collectionFollowers || [] });
	}
);

export default handler;
