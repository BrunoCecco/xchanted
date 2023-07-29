import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { updateUserById } from '../../../api-lib/db/user';
import { auths, database, validateBody } from "../../../api-lib/middlewares";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post( 
    validateBody({
      type: 'object',
      properties: {
        field: { type: 'string' },
      },
      required: ['field'],
      additionalProperties: false,
    }),
    async (req, res) => {
      let field = req.body.field
      req.user[field] = ""
      const user = await updateUserById(req.db, req.user._id, {
          ...(req.user),
      }).then(user => {        
          console.log(user);
          console.log("deleted field successfully")
          res.json({ user });
      }).catch(err => {
          console.log(err);
          res.status(500).json({ error: err });
      });
  });


export default handler;