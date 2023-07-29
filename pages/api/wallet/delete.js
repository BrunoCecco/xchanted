import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import { updateUserById } from "../../../api-lib/db/user";
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
			walletChain: { type: "string" },
			walletId: { type: "string" },
		},
		required: ["walletChain", "walletId"],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}
		let walletId = req.body.walletId;
		let walletChain = req.body.walletChain;

		const replica = req.user[walletChain];
		const index = replica.findIndex((i) => i._id == walletId);
		replica.splice(index, 1);

		req.user[walletChain] = replica;
		const user = await updateUserById(req.db, req.user._id, {
			...req.user,
			lastUpdated: 0,
		});
		console.log(user);
		console.log("deleted wallet successfully");
		// Add user to queue
		const queueResponse = await addUserToQueue(
			req.bullmq.userQueue,
			req.user._id,
			1
		);
		// console.log(queueResponse)
		res.status(200).json({ user: user, queueResponse });
	}
);

export default handler;
