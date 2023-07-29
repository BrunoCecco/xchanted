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

handler.patch(
	validateBody({
		type: "object",
		properties: {
			walletChain: { type: "string" },
			walletId: { type: "string" },
			name: { type: "string" },
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

		const chainWallets = req.user[walletChain];

		for (const w of chainWallets) {
			if (w._id === walletId) {
				w.name = req.body.name;
				break;
			}
		}

		const user = await updateUserById(req.db, req.user._id, {
			...(typeof walletId === "string" && {
				[walletChain]: chainWallets,
			}),
		});

		// console.log(queueResponse)
		res.status(200).json({ user: user });
	}
);

export default handler;
