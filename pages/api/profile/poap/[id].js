import nc from "next-connect";
import { ncOpts } from "../../../../api-lib/nc";
import {
	setPoaps,
	findUserByUsername,
	findUserById,
} from "../../../../api-lib/db/user";
import { auths, database } from "../../../../api-lib/middlewares";
import axios from "axios";

const handler = nc(ncOpts);
handler.use(database, ...auths);

const fetchPoaps = async (addrs) => {
	try {
		const poapsResult = await axios.get(
			`https://api.poap.xyz/actions/scan/${addrs}`
		);
		return poapsResult.data;
	} catch (error) {
		console.log("error", error);
		return [];
	}
};

handler.get(async (req, res) => {
	const user = await findUserById(req.db, req.query.id);
	if (!user) {
		return {
			poaps: [],
		};
	}

	if (!user.ethereum) return res.json({ poaps: null });

	const wallets = user.ethereum;
	var poapPromise = [];
	for (let i = 0; i < wallets.length; i++) {
		poapPromise.push(fetchPoaps(wallets[i].address));
	}

	const resultArr = await Promise.all(poapPromise);
	var poaps = [].concat.apply([], resultArr);

	setPoaps(req.db, user._id, poaps);

	return res.json({ poaps });
});

export default handler;
