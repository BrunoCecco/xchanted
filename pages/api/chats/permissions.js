import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { updatePermissions, getPermissions } from '../../../api-lib/db/permissions';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.patch(
    async(req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({ user: null });

        try {
            const r = await updatePermissions(req.db,req.body.userid,req.body.chatP,req.body.chantP,req.body.commentP,req.body.chatCols,req.body.chantCols,req.body.commentCols);
            res.status(200).json({r})
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error updating permissions"});
        }
    }
)

handler.post(
    async(req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({user:null});

        try{
            const r = await getPermissions(req.db,req.body.userid);
            res.status(200).json({r})
        } catch (e) {
            res.status(400).json({error:"error getting permissions"});
        }
    }
)

export default handler;