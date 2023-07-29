import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { auths, database } from "../../../api-lib/middlewares";
import { findUserRecommendations } from "../../../api-lib/db/recommendation";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.get(
    async (req, res) => {
        try {
            let { limitUsers } = req.query;
            limitUsers = limitUsers ? parseInt(limitUsers) : 20;
            const users = await findUserRecommendations(req.db, req.user, limitUsers);
            res.status(200).json({
                users,
                ok: true,
            });
        } catch (e) {
            console.log(e);
            res.status(400).json({ error: "error finding user recommendations" });
        }
    });


export default handler;