import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { database } from "../../../api-lib/middlewares";
import { searchCollections, searchNfts, searchUsers } from "../../../api-lib/db/search";

const handler = nc(ncOpts);
handler.use(database);

handler.get(
  async (req, res) => {
    try {
      const { q } = req.query;
      console.log(q)
      let userSearchResults = await searchUsers(req.db, q);
      let nftSearchResults = await searchNfts(req.db, q);
      let collectionSearchResults = await searchCollections(req.db, q);
      // let chatSearchResults = await searchChats(req.db,q);

      userSearchResults = await userSearchResults.toArray()
      nftSearchResults = await nftSearchResults.toArray()
      collectionSearchResults = await collectionSearchResults.toArray()
      // chatSearchResults = await chatSearchResults.toArray()

      res.status(200).json({
        searchResults: {
          users: userSearchResults,
          nfts: nftSearchResults,
          collections: collectionSearchResults,
          // chats: chatSearchResults,
        },
        ok: true,
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: "error finding search results" });
    }
  });


export default handler;