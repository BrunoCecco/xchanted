import { auths, database} from '../../../../api-lib/middlewares/';
import { ncOpts } from '../../../../api-lib/nc';
import nc from 'next-connect';
import { findUserByUsername, findFollowByIds } from '../../../../api-lib/db/user';

const handler = nc(ncOpts);

handler.use(database, ...auths);

handler.get(async (req, res) => {
  if(!req.query.username) {
    req.status(401).end();
    return;
  }

  const user = await findUserByUsername(req.db, req.query.username);

  let following = [];
  if(user.following) {
    const followingCursor = await findFollowByIds(req.db, user.following, 10, req.user._id);
    following = await followingCursor.toArray();
  } else {
    following = [];
  }

  let followers = [];
  if(user.followers) {
    const followersCursor = await findFollowByIds(req.db, user.followers, 10, req.user._id);
    followers = await followersCursor.toArray();
  } else {
    followers = [];
  }

  res.status(200).json({ following: following, followers: followers });
});

export default handler;
