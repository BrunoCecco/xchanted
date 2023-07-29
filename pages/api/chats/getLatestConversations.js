
import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { getConversations, getBucketsFromUnread } from '../../../api-lib/db/dms';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post(
    async (req,res) => {
        req.body = JSON.parse(req.body);
        if (!req.user) return res.json({ user:null });
        try {
            const convos = await getConversations(req.db,req.body.chatIds);

            const latestConvos = await Promise.all(
                convos.map(async(c) => {
                let thechatid = c._id;
                let lastReadTime="";
                if (!req.body.user.lastReads?.thechatid){
                    lastReadTime = Date.now();
                } else {
                    lastReadTime = req.body.user.lastReads?.thechatid;
                }
                return {
                    latestMessage: c.latestMessage,
                    fromSelf: c.latestMessageSender.toString() == req.body.user._id.toString(),
                    lastUpdated: c.lastUpdated,
                    users: c.users,
                    name: c.name,
                    image: c.image,
                    chatid: thechatid,
                    unread: await getBucketsFromUnread(req.db,c._id,lastReadTime),
                };
                
            }));
            res.json(latestConvos);
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error getting dms from db"});
        }
    }
)
export default handler;