import { findUserByUsername } from '../../../api-lib/db/user';
import { database } from '../../../api-lib/middlewares';
import { ncOpts } from '../../../api-lib/nc';

import nc from 'next-connect';

const handler = nc(ncOpts);

handler.use(database);

handler.get(async (req, res) => {

  const user = await findUserByUsername(
    req.db,
    req.query.user
  );
  if (!user) {
    return {
      notFound: true,
    };
  }
  user._id = String(user._id);

  res.status(200).send({user});
});

export default handler;
