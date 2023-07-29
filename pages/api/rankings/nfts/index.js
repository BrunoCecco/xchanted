import nc from "next-connect";
import { ncOpts } from "../../../../api-lib/nc";
import { database } from "../../../../api-lib/middlewares";
import {
	getNftsByAllTimeViewCount,
	getNftsByHighestAppreciates,
} from "../../../../api-lib/db/analytics";

const handler = nc(ncOpts);
handler.use(database);

handler.get(async (req, res) => {
	try {
		const rankingTypes = ["Views", "Appreciates"];

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
		if (!sort) sort = -1; //descending
		else sort = parseInt(sort);

		let nfts = [];
		if (type == "Views") {
			const nftsCursor = await getNftsByAllTimeViewCount(
				req.db,
				limit,
				skip,
				chain,
				sort
			);
			nfts = await nftsCursor.toArray();
		} else if (type == "Appreciates") {
			const nftsCursor = await getNftsByHighestAppreciates(
				req.db,
				limit,
				skip,
				chain,
				sort
			);
			nfts = await nftsCursor.toArray();
		}

		res.status(200).json(nfts);
	} catch (e) {
		console.log(e);
		res.status(400).json({ error: "error finding rankings" });
	}
});

export default handler;
