import nc from "next-connect";
import { ncOpts } from "../../../../../api-lib/nc";
import { findAllPoapHolders } from "../../../../../api-lib/db/user";
import { auths, database } from "../../../../../api-lib/middlewares";
import axios from "axios";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.get(async (req, res) => {
	const holdersCursor = await findAllPoapHolders(
		req.db,
		req.query.eventId,
		req.user._id
	);
	const holders = (await holdersCursor.toArray()) || [];

	return res.json({ holders });
});

export default handler;
