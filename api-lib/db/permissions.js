import { ObjectId } from "mongodb";

export async function updatePermissions(db,userid,chatsP,chantsP,commentsP,chatCols,chantCols,commentCols){
    return await db
    .collection("users")
    .findOneAndUpdate(
        {
            _id: ObjectId(userid)
        },
        {
            $set:{
                'permissions':{
                    'chats':chatsP,
                    'chants':chantsP,
                    'comments':commentsP,
                    'chatCol':chatCols,
                    'chantCol':chantCols,
                    'commentCol':commentCols,
                }
            }
        },
        {upsert:true}
    )
}

export async function getPermissions(db,userid){
    let permissionsArr = await db
    .collection('users')
    .aggregate([
        {
            $match: {
                _id: ObjectId(userid)
            }
        },
        {
            $project: {
                _id:0, permissions:1, following:1
            }
        }

    ]).toArray();
    return permissionsArr[0];
}