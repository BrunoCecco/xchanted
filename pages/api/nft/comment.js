import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { addComment, removeComment } from '../../../api-lib/db/comment';

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post( 
  validateBody({
    type: 'object',
    properties: {
      nftId: { type: 'string' },
      text: {type: 'string'}
    },
    required: ['nftId', 'text'],
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) return res.json({ user: null });

    try {
      const r = await addComment(req.db, req.body.nftId, req.user, req.body.text);
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
      commentId: { type: 'string' },
    },
    required: ['commentId'],
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) return res.json({ user: null });

    try {
      const r = await removeComment(req.db, req.body.commentId, req.user._id);
      res.status(200).json({r});
    } catch(e) {
      console.log(e);
      res.status(400).json({error: "error writing to db"});
    }
});

export default handler;