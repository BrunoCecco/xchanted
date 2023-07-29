import nc from "next-connect";
import { ncOpts } from '../../../../api-lib/nc';
import { auths, database, validateBody } from "../../../../api-lib/middlewares";
import { findComments2 } from '../../../../api-lib/db/comment';

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post( 
  validateBody({
    type: 'object',
    properties: {
      skip: { type: 'number' },
    },
    required: ['skip'],
    additionalProperties: false,
  }),
  async (req, res) => {

    try {
      const commentCursor = await findComments2(req.db, req.query.nftId, req.user ? req.user._id : null, req.body.skip);
      const comments = JSON.stringify(await commentCursor.toArray());
      res.status(200).json({ comments });
    } catch(e) {
      console.log(e);
      res.status(400).json({error: "error finding comments"});
    }
});


export default handler;