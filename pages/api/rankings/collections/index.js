import nc from "next-connect";
import { ncOpts } from "../../../../api-lib/nc";
import { database } from "../../../../api-lib/middlewares";
import {
	getCollectionsByAllTimeViewCount,
	getCollectionsByFollowersCount,
	getNftsByAllTimeViewCount,
	getNftsByHighestAppreciates,
} from "../../../../api-lib/db/analytics";

const handler = nc(ncOpts);
handler.use(database);

handler.get(async (req, res) => {
	try {
		const rankingTypes = ["Views", "Followers"];

		console.log(req.query);
		let { type, limit, skip, chain, sort } = req.query;

		if (!type || rankingTypes.includes(type) === false) {
			res.statusCode(404).json({
				error: `error finding rankings by type ${type}`,
			});
		}
		if (!limit) limit = 10;
		else limit = parseInt(limit);
		if (!skip) skip = 0;
		else skip = parseInt(skip);
		if (!chain) chain = -1; //all
		else chain = parseInt(chain);
		if (!sort) chain = -1; //all
		else sort = parseInt(sort);

		let collections = [];
		if (type == "Views") {
			const collectionsCursor = await getCollectionsByAllTimeViewCount(
				req.db,
				limit,
				skip,
				chain,
				sort
			);
			collections = await collectionsCursor.toArray();
		} else if (type == "Followers") {
			const collectionsCursor = await getCollectionsByFollowersCount(
				req.db,
				limit,
				skip,
				chain,
				sort
			);
			collections = await collectionsCursor.toArray();
		} else if (type == "Xchanted Owners") {
			//TODO
		}

		res.status(200).json(collections);
	} catch (e) {
		console.log(e);
		res.status(400).json({ error: "error finding rankings" });
	}
});

export default handler;
