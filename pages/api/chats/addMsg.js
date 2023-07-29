import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { updateConversation, updateMsgBucket } from '../../../api-lib/db/dms';
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { validate } from "uuid";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post(
    async (req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({ user: null });

        try {
            const r = await updateMsgBucket(req.db,req.body.chatId,req.body.from,req.body.msgText,req.body.senderPfp,req.body.dmId);
            //also update conversation
            
            try {
                await updateConversation(req.db,req.body.chatId,req.body.msgText,req.body.from);
            } catch (e) {
                console.log(e);
                res.status(400).json({error:"error updating conversation"})
            }

            res.status(200).json({r})
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error adding dm to db"});
        }
    }
);


export default handler;