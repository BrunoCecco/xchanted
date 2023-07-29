
import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { checkChatExists } from '../../../api-lib/db/dms';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post(
    async (req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({ user:null });
        try {
            const result = await checkChatExists(req.db,req.body.usersArr);
            res.json(result);
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error checking chat exists"});
        }
    }
)
export default handler;