import { ObjectId } from "mongodb";

export async function findComments(db, nftId) {
  return await db.collection("comments").find({ post: nftId }).limit(10);
}

export async function findComments2(db, nftId, userId, skip) {
  return await db.collection("comments").aggregate([
    { $match: { post: nftId } },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: 6 },
          {
            $project: {
              user: 1,
              text: 1,
              time: 1,
              appreciatesNum: {
                $cond: {
                  if: { $ne: [{ $type: "$appreciates" }, "missing"] },
                  then: { $size: "$appreciates" },
                  else: 0,
                },
              },
              userAppreciated: {
                $cond: {
                  if: { $ne: [{ $type: "$appreciates" }, "missing"] },
                  then: { $in: [new ObjectId(userId), "$appreciates"] },
                  else: false,
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    username: 1,
                    usernameNFT: 1,
                    profilePicture: 1,
                    banner: 1,
                    selectedCollections: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$user",
          },
        ],
      },
    },
  ]);
}

export async function addComment(db, nftId, user, text) {
  return await db.collection("comments").insertOne({
    post: nftId,
    user: new ObjectId(user._id),
    username: user.username,
    usernameNFT: user.usernameNFT,
    text: text,
    time: new Date(),
    appreciates: [],
  });
}

export async function removeComment(db, id, userId) {
  return await db.collection("comments").deleteOne({
    $and: [{ _id: new ObjectId(id) }, { user: new ObjectId(userId) }],
  });
}
