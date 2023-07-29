// Queue NFT for update

import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { auths, bullmq, database, validateBody } from "../../../api-lib/middlewares";
import { addNftToQueue } from "../../../api-lib/bullmq/nft";

const handler = nc(ncOpts);
handler.use(database, ...auths, bullmq);

handler.post(
  async (req, res) => {
      const nftId = JSON.parse(req.body).nftId; // Not sure about this. It should have parsed it automatically
    const queueResponse = await addNftToQueue(req.bullmq.nftQueue, nftId, 1);
    console.log(`Adding NFT ${nftId} to queue`)

    res.status(200).json({
      message: "NFT Queued for update", // TODO: handle errors
      queueResponse
    })
  }
)

export default handler;
