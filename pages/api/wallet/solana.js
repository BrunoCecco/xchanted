import nc from "next-connect";
import { sign } from "tweetnacl";
import bs58 from "bs58";

import { ncOpts } from "../../../api-lib/nc";
import {
	findUserById,
	updateUserById,
	checkIfAddrRegistered,
} from "../../../api-lib/db/user";
import {
	auths,
	bullmq,
	database,
	validateBody,
} from "../../../api-lib/middlewares";
import { addUserToQueue } from "../../../api-lib/bullmq/user";

const handler = nc(ncOpts);
handler.use(database, ...auths, bullmq);

handler.post(
	validateBody({
		type: "object",
		properties: {
			publicKey: { type: "string" },
			walletAddr: { type: "string" },
			walletId: { type: "string" },
			walletName: { type: "string" },
			signature: { type: "string" },
		},
		required: [
			"walletId",
			"walletAddr",
			"publicKey",
			"walletName",
			"signature",
		],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}
		const u = await findUserById(req.db, req.user._id);

		const encodedMessage = new TextEncoder().encode(u.nonce);
		const sig = new Uint8Array(Buffer.from(req.body.signature, "base64"));
		const pk = new Uint8Array(Buffer.from(req.body.publicKey, "base64"));

		//const verified = nacl.sign.detached.verify(encodedMessage, encodedSig, encodedPublicKey);
		const verified = await sign.detached.verify(encodedMessage, sig, pk);

		const pkTest = Buffer.from(req.body.publicKey, "base64").toString(
			"hex"
		);
		const addrTest = Buffer.from(bs58.decode(req.body.walletAddr)).toString(
			"hex"
		);

		const verifyAddress = addrTest == pkTest;

		//check db if exists
		const isRegistered = await checkIfAddrRegistered(
			req.db,
			"solana",
			req.body.walletAddr
		);
		const arrRegistered = await isRegistered.toArray();
		if (arrRegistered.length > 0) {
			return res.status(409).json({
				message:
					"This address is already registered under a different account",
			});
		}

		if (verified && verifyAddress) {
			let solana = u.solana || [];
			const newElmnt = {
				_id: req.body.walletId,
				name: req.body.walletName,
				address: req.body.walletAddr,
			};
			solana.push(newElmnt);
			const user = await updateUserById(req.db, req.user._id, {
				...(typeof req.body.walletAddr === "string" && { solana }),
				lastUpdated: 0,
			});
			// Add user to queue
			const queueResponse = await addUserToQueue(
				req.bullmq.userQueue,
				req.user._id,
				1
			);
			res.status(200).json({ user: user, queueResponse });
		} else {
			res.status(400).json({ error: "invalid address" });
		}
	}
);

export default handler;
