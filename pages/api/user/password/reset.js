import { sendMail } from "../../../../api-lib/mail";
import { database, validateBody } from "../../../../api-lib/middlewares";
import { addToken } from "../../../../api-lib/db/tokens";
import nc from "next-connect";
import normalizeEmail from "validator/lib/normalizeEmail";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const handler = nc();
handler.use(database);

handler.post(
	validateBody({
		type: "object",
		properties: {
			email: { type: "string", minLength: 1 },
		},
		required: ["email"],
		additionalProperties: false,
	}),
	async (req, res) => {
		const email = normalizeEmail(req.body.email);

		const user = await req.db.collection("users").findOne({ email });

		if (!user) {
			res.status(400).json({
				error: {
					message: "We couldn’t find that email. Please try again.",
				},
			});
			return;
		}

		const securedTokenId = nanoid(32); // create a secure reset password token

		const token = await addToken(req.db, {
			_id: securedTokenId,
			creatorId: user._id,
			type: "passwordReset",
			expireAt: new Date(Date.now() + 20 * 60 * 1000), // let's make it expire after 20 min
		});

		await sendMail({
			to: user.email,
			from: "team@xchanted.com",
			subject: "[Xchanted] Reset your password.",
			html: `
      <div>
        <p>Hello, ${user.name}</p>
        <p>Please follow <a href="https://www.xchanted.com/forgot-password/${securedTokenId}">this link</a> to reset your password.</p>
      </div>
      `,
		});

		res.status(204).end();
	}
);

handler.put(
	validateBody({
		type: "object",
		properties: {
			password: { type: "string", minLength: 8 },
			token: { type: "string", minLength: 0 },
		},
		required: ["password", "token"],
		additionalProperties: false,
	}),
	async (req, res) => {
		const deletedToken = await req.db
			.collection("tokens")
			.findOneAndDelete({ _id: req.body.token, type: "passwordReset" });

		console.log(deletedToken);

		if (!deletedToken.value) {
			res.status(403).end();
			return;
		}

		const password = await bcrypt.hash(req.body.password, 10);
		await req.db
			.collection("users")
			.updateOne(
				{ _id: deletedToken.value.creatorId },
				{ $set: { password } }
			);

		res.status(204).end();
	}
);

export default handler;
