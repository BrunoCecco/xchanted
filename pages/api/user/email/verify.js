import { sendMail } from "../../../../api-lib/mail";
import { auths, database } from "../../../../api-lib/middlewares";
import { addToken } from "../../../../api-lib/db/tokens";
import nc from "next-connect";
import { nanoid } from "nanoid";

const handler = nc();
handler.use(database, ...auths);

handler.post(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  }

  const securedTokenId = nanoid(32);

  const token = await addToken(req.db,
    {
      _id: securedTokenId,
      creatorId: req.user._id,
      type: "emailVerify",
      expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // expires in 24h
    });

   await sendMail({
    to: req.user.email,
    from: "team@xchanted.com",
    subject: `Verification Email for ${process.env.WEB_URI}`,
    html: `
      <div>
        <p>Hello, ${req.user.name}</p>
        <p>Please follow <a href="${process.env.WEB_URI}/verify-email/${token._id}">this link</a> to confirm your email.</p>
      </div>
      `,
  }); 

  res.status(204).end();
});

export default handler;