import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { addConversation } from '../../../api-lib/db/dms';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post(
    async(req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({ user: null });

        try {
            const r = await addConversation(req.db,req.body.fromUser,req.body.toUser,req.body.name);
            res.status(200).json({r})
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error adding new conversation"});
        }
    }
)

export default handler;