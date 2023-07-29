import nc from "next-connect";
import { ncOpts } from '../../../../api-lib/nc';
import { auths, database, validateBody } from "../../../../api-lib/middlewares";
import { findRecommendedNfts } from "../../../../api-lib/db/collection";

const handler = nc(ncOpts);
handler.use(database, ...auths);

const MAX_NFTS = 10;

handler.get(
  async (req, res) => {
    try {
      let recommendedNfts = await findRecommendedNfts(req.db, req.query.nftId, MAX_NFTS);
      recommendedNfts = recommendedNfts.filter(nft => {
        return '_id' in nft
      })
      res.status(200).json({ recommendedNfts });
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: "error finding recommendations" });
    }
  });


export default handler;