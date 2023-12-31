import { passport } from "../../api-lib/auth";
import { auths, database } from "../../api-lib/middlewares";
import { ncOpts } from "../../api-lib/nc";
import nc from "next-connect";

const handler = nc(ncOpts);

handler.use(database, auths);

handler.post(passport.authenticate("local"), (req, res) => {
	res.json({ user: req.user });
});

handler.delete(async (req, res) => {
	await req.session.destroy();
	// or use req.logOut();
	res.status(204).end();
});

export default handler;
