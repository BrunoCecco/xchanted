import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import { updateUserById } from "../../../api-lib/db/user";
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.get(async (req, res) => {
	if (!req.user) return res.json({ user: null });

	const nonce = Keypair.generate().publicKey.toBase58();

	const user = await updateUserById(req.db, req.user._id, {
		...(typeof nonce === "string" && { nonce }),
	});

	return res.json({ nonce: nonce });
});

export default handler;
