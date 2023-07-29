import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { addAppreciate, removeAppreciate } from '../../../api-lib/db/appreciate';
import { ObjectId } from "mongodb";
import { changeNFTAppreciateCount } from "../../../api-lib/db/analytics";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post( 
  validateBody({
    type: 'object',
    properties: {
      nftId: { type: 'string' },
      type: {type: 'string'}
    },
    required: ['nftId', 'type'],
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) return res.status(400).json({ user: null });
 
   if(req.body.type == "comments") {
     req.body.nftId = new ObjectId(req.body.nftId );
     console.log(req.user._id)
   }
   
    try {
      const r = await addAppreciate(req.db, req.body.type, req.body.nftId, req.user._id);
      changeNFTAppreciateCount(req.db, req.body.nftId, true);
      res.status(200).json({r}); 
    } catch(e) {
      console.log(e);
      res.status(400).json({error: "error writing to db"});
    }
});


handler.delete( 
  validateBody({
    type: 'object',
    properties: {
      nftId: { type: 'string' },
      type: {type: 'string'}
    },
    required: ['nftId', 'type'],
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) return res.status(400).json({ user: null });

    if(req.body.type == "comments") {
      req.body.nftId = new ObjectId(req.body.nftId );
    }
    try {
      const r = await removeAppreciate(req.db, req.body.type, req.body.nftId, req.user._id);
      changeNFTAppreciateCount(req.db, req.body.nftId, false);
      res.status(200).json({r});
    } catch(e) {
      console.log(e);
      res.status(400).json({error: "error writing to db"});
    }
});

export default handler;
