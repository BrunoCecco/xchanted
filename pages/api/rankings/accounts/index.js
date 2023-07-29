import nc from "next-connect";
import { ncOpts } from "../../../../api-lib/nc";
import { database } from "../../../../api-lib/middlewares";
import {
	getUsersByAllTimeViewCount,
	getUsersByFollowersCount,
	getUsersByNftCount,
} from "../../../../api-lib/db/analytics";

const handler = nc(ncOpts);
handler.use(database);

handler.get(async (req, res) => {
	try {
		const rankingTypes = ["Views", "Followers", "Nft Count"];

		console.log(req.query);
		let { type, limit, skip, sort } = req.query;

		if (!type || rankingTypes.includes(type) === false) {
			res.status(404).json({
				error: `error finding rankings by type ${type}`,
			});
		}
		if (!limit) limit = 10;
		else limit = parseInt(limit);
		if (!skip) skip = 0;
		else skip = parseInt(skip);
		if (!sort) sort = -1;
		else sort = parseInt(sort);

		let users = [];
		if (type == "Views") {
			const usersCursor = await getUsersByAllTimeViewCount(
				req.db,
				limit,
				skip,
				sort
			);
			users = await usersCursor.toArray();
		} else if (type == "Followers") {
			const usersCursor = await getUsersByFollowersCount(
				req.db,
				limit,
				skip,
				sort
			);
			users = await usersCursor.toArray();
		} else if (type == "Nft Count") {
			const usersCursor = await getUsersByNftCount(
				req.db,
				limit,
				skip,
				sort
			);
			users = await usersCursor.toArray();
		}

		res.status(200).json(users);
	} catch (e) {
		console.log(e);
		res.status(400).json({ error: "error finding rankings" });
	}
});

export default handler;
