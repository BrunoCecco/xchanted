
import { ObjectId } from "mongodb";

export async function addConversation(db, fromUser, toUser,name) {
  const convoRes = await db.collection("conversations").insertOne({
    users: [fromUser, toUser].sort(),
    dateCreated: new Date(),
    latestMessage: "",
    latestMessageSender: "",
    lastUpdated: new Date(),
    name: name,
    image: "",
  });
  return convoRes;
}

export async function addMsg(db, chatId, fromPassed, msgTextPassed,senderPfp) {
  return await db.collection("dms").insertOne({
    chatId: chatId,
    msgText: msgTextPassed,
    time: new Date(),
    sender: fromPassed,
    senderPfp: senderPfp,
  });
}

export async function getAllMessages(db, chatIdR) {
  return await db
    .collection("dms")
    .find({
      chatId: chatIdR,
    })
    .sort({ time: 1 })
    .toArray();
}

export async function getBucketMessages(db,chatIdR,bucketNum,limit){
  let bucketM = await db 
  .collection("messages").aggregate([
    {$match:{
      chatId:chatIdR,
    }},
    {$sort:{timeCreated:-1}},
    {$skip:bucketNum},
    {$project:{history:1,_id:0}},
  ])
  if (limit){
    return bucketM.limit(1).toArray();
  } else {
    return bucketM.toArray();
  }
}


export async function getConversations(db, chatIds) {
  const chatIds2 = chatIds.map((chatId) => ObjectId(chatId));
  return await db
    .collection("conversations")
    .aggregate([
      { $match: { _id: { $in: chatIds2 } } },
      { $sort: { lastUpdated: -1 } },
    ])
    .toArray();
}

export async function updateConversation(
  db,
  chatId,
  latestMessageR,
  latestMessageSenderR,
) {
  return await db.collection("conversations").updateOne(
    {
      _id: ObjectId(chatId),
    },
    {
      $set: {
        latestMessage: latestMessageR,
        latestMessageSender: latestMessageSenderR,
        lastUpdated: new Date(),
      },
    }
  );
}

export async function updateMsgBucket(
  db,
  chatId,
  fromPassed,
  msgTextPassed,
  senderPfp,
  dmId,
){
  return await db.collection("messages").updateOne({
    _id: {$regex:new RegExp("^" + chatId.toString() + "_")},
    count: {$lt:10},
  },{
    $push: {
      "history":{
        dmId: dmId,
        msgText: msgTextPassed,
        time: new Date(),
        sender: fromPassed,
        senderPfp: senderPfp,
      }
    },
    $set: {lastUpdated:Date.now()},
    $inc:{count:1},
    $setOnInsert:{"_id": `${chatId}_${Date.now()}`,"timeCreated":Date.now(),"chatId":chatId}
  },
  {upsert: true})
}

export async function getBucketsFromUnread(db,chatidR,fromTime){
  return await db.collection("messages").aggregate([
    {
      $match: {
        chatId: chatidR,
        $or:[{lastUpdated: {$gt:fromTime}},{timeCreated:{$gt:fromTime}}],
      }
    },
    {$unwind:'$history'},
    {
      $project: {
        _id:0,dmId:1,msgText:1,sender:1,time:1,senderPfp:1
      }
    }
  ]).toArray();
}

export async function checkChatExists(db,userArr){
  return await db.collection("conversations").find(
    {
      users: userArr,
    },
  ).toArray();
}

export async function addToChatHist(db, userid, toAdd) {
  return await db.collection("users").updateOne(
    {
      _id: ObjectId(userid),
    },
    { $addToSet: { chatHist: ObjectId(toAdd)} }
  );
}

export async function updateLastRead(db,userid,chatidR,dmId){
  return await db.collection("users").updateOne(
    {
      _id: ObjectId(userid),
    },
    {
      $set: {['lastReads.'+chatidR]: dmId}
    },
    {upsert:true}
  )
}

export async function getUnreads(db,timeChat,timeUserLastRead,chatidR){
  let unread = await db.collection("dms").aggregate([
    {
      $match: {
        chatId: chatidR,
        time:{$gt:`${timeUserLastRead}`}
      }
    },
    {
      $project: {
        _id:1,msgText:1,sender:1
      }
    }
  ]).toArray();
  return unread;
}

export async function mostRecentChatid(db,user){
  let convos = await db.collection("users").aggregate([
    {
      $match: {
        _id: ObjectId(user),
      }
    },
    {
      $project: {
        lastReads:1,
        _id:0,
      }
    },
  ]).toArray();

  if (convos[0].lastReads != undefined) { // if user has lastReads
    console.log("conversations...",convos[0].lastReads);
    let sortable = [];
    for (var c in convos[0].lastReads) {
        sortable.push([c, convos[0].lastReads[c]]);
    }

    sortable.sort(function(a, b) {
        return b[1]-a[1]; // sort descending (latest date first)
    });
    
    console.log("returning most recent chat...",sortable[0][0].toString())
    return sortable[0][0].toString();
  
  } else {
    return [];
  }
}