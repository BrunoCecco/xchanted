import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { updateLastRead } from '../../../api-lib/db/dms';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post(
    async(req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({ user: null });

        try {
            const r = await updateLastRead(req.db,req.body.userid,req.body.chatid,req.body.dmId);
            res.status(200).json({r})
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error changing latest reads"});
        }
    }
)

export default handler;