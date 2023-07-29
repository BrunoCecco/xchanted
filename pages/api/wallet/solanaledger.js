import nc from "next-connect";
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
import axios from "axios";

const handler = nc(ncOpts);
handler.use(database, ...auths, bullmq);

handler.post(
	validateBody({
		type: "object",
		properties: {
			publicKey: { type: "string" },
			walletId: { type: "string" },
			walletName: { type: "string" },
			signature: { type: "string" },
		},
		required: ["walletId", "publicKey", "walletName", "signature"],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}
		const u = await findUserById(req.db, req.user._id);

		const response = await waitUntil(req.body.signature);

		console.log(response.data);

		const verifyNonce = response.data.inputAccount[1].account == u.nonce;
		const verifySender =
			response.data.inputAccount[0].account == req.body.publicKey;

		//check db if exists
		const isRegistered = await checkIfAddrRegistered(
			req.db,
			"solana",
			req.body.publicKey
		);
		const arrRegistered = await isRegistered.toArray();
		if (arrRegistered.length > 0) {
			return res.status(409).json({
				message:
					"This address is already registered under a different account",
			});
		}

		if (verifyNonce && verifySender) {
			let solana = u.solana || [];
			const newElmnt = {
				_id: req.body.walletId,
				name: req.body.walletName,
				address: req.body.publicKey,
			};
			solana.push(newElmnt);
			const user = await updateUserById(req.db, req.user._id, {
				...(typeof req.body.publicKey === "string" && { solana }),
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

async function waitUntil(signature) {
	return await new Promise((resolve) => {
		const interval = setInterval(async () => {
			try {
				const response = await axios.get(
					`https://public-api.solscan.io/transaction/${signature}`
				);
				console.log("lets", response?.data);
				if (response && response.data && response.data.inputAccount) {
					resolve(response);
					clearInterval(interval);
				}
			} catch (e) {
				console.log(e);
			}
		}, 2500);
	});
}

export default handler;
