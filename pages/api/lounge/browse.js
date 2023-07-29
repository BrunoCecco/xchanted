import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { auths, database } from "../../../api-lib/middlewares";
import { findNFTRecommendations } from "../../../api-lib/db/recommendation";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.get(
    async (req, res) => {
        try {
            let { collectionIds, limitCollections, limitNfts, nftsPerCollection, offset } = req.query;
            limitCollections = limitCollections ? parseInt(limitCollections) : 20;
            limitNfts = limitNfts ? parseInt(limitNfts) : 15;
            nftsPerCollection = nftsPerCollection ? parseInt(nftsPerCollection) : 2;
            offset = offset ? parseInt(offset) : 0;
            const nfts = await findNFTRecommendations(req.db, req.user, collectionIds, limitCollections, limitNfts, nftsPerCollection, offset);
            res.status(200).json({
                nfts,
                ok: true,
            });
        } catch (e) {
            console.log(e);
            res.status(400).json({ error: "error finding recommendations" });
        }
    });


export default handler;