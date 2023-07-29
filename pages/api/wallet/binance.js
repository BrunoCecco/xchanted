import nc from "next-connect";
import { ethers } from "ethers";
import { ncOpts } from "../../../api-lib/nc";
import { findUserByUsername, updateUserById } from "../../../api-lib/db/user";
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
			walletAddr: { type: "string" },
			signature: { type: "string" },
			walletName: { type: "string" },
		},
		required: ["walletAddr", "signature", "walletName"],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}
		const u = await findUserByUsername(req.db, req.user.username);

		const signerAddr = ethers.utils.verifyMessage(
			u.nonce,
			req.body.signature
		);

		//Equal together
		if (req.body.walletAddr == signerAddr) {
			let binance = {};
			binance[req.body.walletName] = req.body.walletAddr;
			const user = await updateUserById(req.db, req.user._id, {
				...(typeof req.body.walletAddr === "string" && { binance }),
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
