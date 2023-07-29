import { ObjectId } from 'mongodb';

export async function addAppreciate(db, type, id, userId) {  
  return await db
    .collection(type)
    .updateOne({ _id: id }, { $addToSet: { appreciates: new ObjectId(userId) } });
}

export async function removeAppreciate(db, type, id, userId) {
  return await db
    .collection(type)
    .updateOne({ _id: id }, { $pull: { appreciates: new ObjectId(userId) } });
}