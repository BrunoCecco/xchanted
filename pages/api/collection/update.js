import nc from "next-connect";
import { findUserById, bulkUpdateNfts, updateUserCollection, getAllUsersMinified } from '../../../api-lib/db/user';
import { auths, bullmq, database } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths, bullmq);

handler.post(
  async (req, res) => {
    const user = await findUserById(
      req.db,
      req.user._id
    );
    if (!user) {
      return {
        notFound: true,
      };
    }
    // TODO: Make a queue for collection and automatically fetch collection info ig? - Not sure if this is required
    res.status(200).json({
      status: "success"
    })
  }
)

export default handler;
