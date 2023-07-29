import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { findUserByUsername } from '../../../api-lib/db/user';
import { auths, database, validateBody } from "../../../api-lib/middlewares";


const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post( 

    async (req, res) => {
        req.body = JSON.parse(req.body);
        try {
            const r = await findUserByUsername(req.db,req.body.username);
            res.status(200).json({r})
        } catch (e) {
            console.log(e);
            res.status(400).json({error:"error finding friend!"});
        }
    }
);

export default handler;