import nc from "next-connect";
import { ncOpts } from '../../../api-lib/nc';
import { updateUserByIdPull, updateUserByIdPush } from '../../../api-lib/db/user';
import { ObjectId } from 'mongodb';
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { changeUserFollowCount } from "../../../api-lib/db/analytics";

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.post( 
    validateBody({
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
      additionalProperties: false,
    }),
    async (req, res) => {
      if (!req.user) {
        res.json({error: 'Log in required', redirect:'/sign-in'}).end();
        return;
      }
      
      let udone1 = false;
      let udone2 = false;
      //following
      const user1 = await updateUserByIdPush(req.db, req.user._id, {
        ...(req.body.userId && { "following": new ObjectId(req.body.userId) }),
      }).then(user => {    
        udone1 = true;
      }).catch(err => {
          console.log(err);
          res.status(500).json({ error: err });
      });

      //followers
      const user2 = await updateUserByIdPush(req.db, req.body.userId, {
        ...(req.user._id && { "followers": new ObjectId(req.user._id) }),
      }).then(user => {        
        udone2 = true;
      }).catch(err => {
          console.log(err);
          res.status(500).json({ error: err });
      });

      if(udone1 && udone2) {
        // Analytics
        changeUserFollowCount(req.db, req.body.userId, true);
        res.status(200).json({user1});
      }
  });

  handler.delete( 
    validateBody({
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
      additionalProperties: false,
    }),
    async (req, res) => {
      if (!req.user) {
        res.json({ error: 'Log in required', redirect: '/sign-in' }).end();
        return;
      }
      
      let udone1 = false;
      let udone2 = false;
      //following
      const user1 = await updateUserByIdPull(req.db, req.user._id, {
        ...(req.body.userId && { "following": new ObjectId(req.body.userId) }),
      }).then(user => {    
        udone1 = true;
      }).catch(err => {
          console.log(err);
          res.status(500).json({ error: err });
      });

      //followers
      const user2 = await updateUserByIdPull(req.db, req.body.userId, {
        ...(req.user._id && { "followers": new ObjectId(req.user._id) }),
      }).then(user => {        
        udone2 = true;
      }).catch(err => {
          console.log(err);
          res.status(500).json({ error: err });
      });

      if(udone1 && udone2) {
        // Analytics
        changeUserFollowCount(req.db, req.body.userId, false);
        res.status(200).json({user1});
      }
  });


export default handler;