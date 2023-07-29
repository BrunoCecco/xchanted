import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { auths, database } from "../../../api-lib/middlewares";
import { findCollectionRecommendations } from "../../../api-lib/db/recommendation";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.get(
    async (req, res) => {
        try {
            let { collectionIds, limitCollections } = req.query;
            limitCollections = limitCollections ? parseInt(limitCollections) : 20;
            const collections = await findCollectionRecommendations(req.db, req.user, collectionIds, limitCollections);
            res.status(200).json({
                collections,
                ok: true,
            });
        } catch (e) {
            console.log(e);
            res.status(400).json({ error: "error finding collection recommendations" });
        }
    });


export default handler;