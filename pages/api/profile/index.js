import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import { updateUserById, findUserById } from "../../../api-lib/db/user";
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { compareSelected } from "../../../utils/compareUserData";

const handler = nc(ncOpts);
handler.use(database, ...auths);

//get user info
handler.get(async (req, res) => {
	if (!req.user) return res.json({ user: null });
	return res.json({ user: req.user });
});

//update user info
handler.patch(
	validateBody({
		type: "object",
		properties: {
			selected: { type: "array" },
			type: { type: "string" },
		},
		required: ["selected", "type"],
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}

		var { selected } = req.body;

		let user = req.user;

		if (req.body.type == "collection") {
			user = await updateUserById(req.db, req.user._id, {
				...(selected && { selectedCollections: selected }),
			});
		} else if (req.body.type == "nft") {
			const u = await findUserById(req.db, req.user._id);

			selected = compareSelected(selected, u.nfts);

			user = await updateUserById(req.db, req.user._id, {
				...(selected && { selected: selected }),
			});
		}

		res.json({ user });
	}
);

export default handler;
