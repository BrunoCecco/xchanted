import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { findCollectionsByIds } from '../../../api-lib/db/collection';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

//get user info 
handler.post(validateBody({
  type: 'object',
  properties: {
    collectionIds: { type: 'array' },
  },
  required: ['collectionIds'],
  additionalProperties: false,
}),
  async (req, res) => {
    if (!req.user) return res.json({ user: null });

    const collectionCursor = await findCollectionsByIds(req.db, req.body.collectionIds);
    const collections = JSON.stringify(await collectionCursor.toArray());

    return res.json(collections);
});

export default handler;