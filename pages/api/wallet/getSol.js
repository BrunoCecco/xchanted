import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import {
	findUserById,
	updateUserById,
	checkIfAddrRegistered,
} from "../../../api-lib/db/user";
import { auths, database } from "../../../api-lib/middlewares";
import * as solanaWeb3 from "@solana/web3.js";
import {
	NAME_PROGRAM_ID,
	performReverseLookup,
	getHashedName,
	getNameAccountKey,
	NameRegistryState,
} from "@bonfida/spl-name-service";

const handler = nc(ncOpts);
handler.use(database, ...auths);

const connection = new solanaWeb3.Connection(
	"https://solana--mainnet.datahub.figment.io/apikey/cb49f9a4880579abe05ac554d467d99d"
);

handler.get(async (req, res) => {
	if (!req.user) return res.json({ user: null });
	var solNamePromises = [];

	for (const wallet of req.user?.solana) {
		if (wallet.address) {
			solNamePromises.push(getSolNames(wallet.address));
		}
	}

	const names = await Promise.all(solNamePromises);
	const merged = [].concat.apply([], names);

	return res.json({ names: merged });
});

const getSolNames = async (address) => {
	const filters = [
		{
			memcmp: {
				offset: 32,
				bytes: address,
			},
		},
	];
	try {
		const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
			filters,
		});
		const results = accounts.map((a) => a.pubkey);
		if (!results[0]) return [];
		let names = [];
		let domainName;
		let domainKey;
		for (let i = 0; i < results.length; i++) {
			domainKey = new solanaWeb3.PublicKey(results[i]);
			domainName = await performReverseLookup(connection, domainKey);
			if (domainName) {
				names.push(domainName + ".sol");
			}
		}
		return names;
	} catch (e) {
		console.error(e);
		return [];
	}
};

export default handler;
