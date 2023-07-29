import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import { findUserByUsername, updateUserById } from "../../../api-lib/db/user";
import {
	auths,
	bullmq,
	database,
	validateBody,
} from "../../../api-lib/middlewares";
import verify from "../../../utils/verify";
import { addUserToQueue } from "../../../api-lib/bullmq/user";

const handler = nc(ncOpts);
handler.use(database, ...auths, bullmq);

handler.post(
	validateBody({
		type: "object",
		properties: {
			walletAddr: { type: "string" },
			walletName: { type: "string" },
			publicKey: { type: "string" },
			signature: { type: "string" },
		},
		required: ["walletAddr", "walletName", "signature"],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}
		const u = await findUserByUsername(req.db, req.user.username);

		String.prototype.hexEncode = function () {
			var hex, i;
			var result = "";
			for (i = 0; i < this.length; i++) {
				hex = this.charCodeAt(i).toString(16);
				result += ("000" + hex).slice(-4);
			}

			return result;
		};

		const sig = await verify(
			req.body.walletAddr,
			req.body.publicKey,
			"05" + u.nonce.hexEncode(),
			req.body.signature
		);

		if (sig) {
			let tezos = {};
			tezos[req.body.walletName] = req.body.walletAddr;
			const user = await updateUserById(req.db, req.user._id, {
				...(typeof req.body.walletAddr === "string" && { tezos }),
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
