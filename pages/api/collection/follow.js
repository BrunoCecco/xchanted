import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import {
	updateUserByIdPull,
	updateUserByIdPush,
} from "../../../api-lib/db/user";
import { ObjectId } from "mongodb";
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import {
	updateCollectionByIdPull,
	updateCollectionByIdPush,
} from "../../../api-lib/db/collection";
import { changeCollectionFollowCount } from "../../../api-lib/db/analytics";

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
		if (!req.user) {
			req.status(401).end();
			return;
		}

		let udone = false;
		let cdone = false;

		// user following
		const user = await updateUserByIdPush(req.db, req.user._id, {
			...(req.body.collectionId && {
				followingCollections: req.body.collectionId,
			}),
		})
			.then((user) => {
				udone = true;
				return user;
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: err });
			});

		// collection followers
		const collection = await updateCollectionByIdPush(
			req.db,
			req.body.collectionId,
			{
				...(req.user._id && { followers: req.user._id.toString() }),
			}
		)
			.then((c) => {
				cdone = true;
				return c;
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: err });
			});

		if (udone && cdone) {
			// Analytics
			changeCollectionFollowCount(req.db, req.body.collectionId, true);
			res.status(200).json({ followers: collection.followers });
		} else {
			res.status(500).json({ error: "something went wrong" });
		}
	}
);

handler.delete(
	validateBody({
		type: "object",
		properties: {
			collectionId: { type: "string" },
		},
		required: ["collectionId"],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}

		let udone = false;
		let cdone = false;

		// user following
		const user = await updateUserByIdPull(req.db, req.user._id, {
			...(req.body.collectionId && {
				followingCollections: req.body.collectionId,
			}),
		})
			.then((user) => {
				udone = true;
				return user;
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: err });
			});

		// collection followers
		const collection = await updateCollectionByIdPull(
			req.db,
			req.body.collectionId,
			{
				...(req.user._id && { followers: req.user._id.toString() }),
			}
		)
			.then((c) => {
				cdone = true;
				return c;
			})
			.catch((err) => {
				console.log(err);
				res.status(500).json({ error: err });
			});

		if (udone && cdone) {
			// Analytics
			changeCollectionFollowCount(req.db, req.body.collectionId, false);
			res.status(200).json({ followers: collection.followers || [] });
		} else {
			res.status(500).json({ error: "something went wrong" });
		}
	}
);

export default handler;
