export async function addToken(db, token) {
  return db
    .collection('tokens')
    .insertOne(token)
    .then((tok) => tok || null);
}