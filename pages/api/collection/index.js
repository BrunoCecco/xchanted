import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { findNfts, updateUserById, setBannerUrl } from '../../../api-lib/db/user';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

//get user info 
handler.get(async (req, res) => {
  if (!req.user) return res.json({ user: null });

  const nftsCursor = await findNfts(req.db, req.user.nfts, req.user ? req.user._id : null);
  const nfts = JSON.stringify(await nftsCursor.toArray());

  return res.json(nfts);
});

export default handler;