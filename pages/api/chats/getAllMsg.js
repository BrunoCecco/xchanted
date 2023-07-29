
import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { getBucketMessages } from '../../../api-lib/db/dms';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post(
    async (req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({ user:null });
        try {
            const messages = await getBucketMessages(req.db,req.body.chatid,req.body.bucketNum,req.body.limit);
            const showMsgs = messages[0]?.history?.map((msg) => {
                var pic = "";
                if (msg.senderPfp){
                    pic = msg.senderPfp;
                }
                return {
                    dmId: msg.dmId,
                    fromSelf: msg.sender.toString() === req.body.from,
                    msgText: msg.msgText,
                    senderid: msg.sender,
                    pic: pic,
                };
            });
            res.json(showMsgs);
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error getting dms from db"});
        }
    }
)
export default handler;
