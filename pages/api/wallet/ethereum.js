import nc from "next-connect";
import { ethers } from "ethers";
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
import nonceText from "../../../components/chains/nonceText.json";

const handler = nc(ncOpts);
handler.use(database, ...auths, bullmq);

handler.post(
	validateBody({
		type: "object",
		properties: {
			walletAddr: { type: "string" },
			walletId: { type: "string" },
			signature: { type: "string" },
			walletName: { type: "string" },
		},
		required: ["walletId", "walletAddr", "signature", "walletName"],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}
		const u = await findUserById(req.db, req.user._id);

		const finalNonce = nonceText.text + "Nonce: " + u.nonce;

		const signerAddr = ethers.utils.verifyMessage(
			finalNonce,
			req.body.signature
		);

		const isRegistered = await checkIfAddrRegistered(
			req.db,
			"ethereum",
			signerAddr
		);
		const arrRegistered = await isRegistered.toArray();

		if (arrRegistered.length > 0) {
			return res.status(409).json({
				message:
					"This address is already registered under a different account",
			});
		}
		//Equal together
		if (req.body.walletAddr == signerAddr) {
			let ethereum = u.ethereum || [];
			const newElmnt = {
				_id: req.body.walletId,
				name: req.body.walletName,
				address: req.body.walletAddr,
			};
			ethereum.push(newElmnt);
			const user = await updateUserById(req.db, req.user._id, {
				...(typeof req.body.walletAddr === "string" && { ethereum }),
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
