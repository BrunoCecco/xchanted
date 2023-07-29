import nc from "next-connect";
import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";
import { ncOpts } from '../../../api-lib/nc';
import { findUserByUsername, updateUserById } from '../../../api-lib/db/user';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.get(async (req, res) => {
  if (!req.user) return res.json({ user: null });

  const nonce = uuidv4();

  const user = await updateUserById(req.db, req.user._id, {
    ...(typeof nonce === 'string' && { nonce }),
  });

  return res.json({ nonce: nonce });
});

handler.post( 
  validateBody({
    type: 'object',
    properties: {
      walletAddr: { type: 'string' },
      signature: { type: 'string' },
    },
    required: ['walletAddr', 'signature'],
    additionalProperties: false,
  }),
  async (req, res) => {
    const u = await findUserByUsername(req.db, req.user.username)
    const signerAddr = ethers.utils.verifyMessage(u.nonce, req.body.signature);

    if(req.body.walletAddr == signerAddr) {
      const user = await updateUserById(req.db, req.user._id, {
        ...(typeof walletAddr === 'string' && { metamask: walletAddr }),
      });
      res.status(200).json({user: user});
    } else {
      res.status(400).json({error: "invalid address"});
    }

});

export default handler;
