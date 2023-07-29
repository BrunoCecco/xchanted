import { create } from 'ipfs-http-client'

// connect to a different API
const ipfs = create('http://0.0.0.0:5001');

export async function ipfsGetJson(cid) {
  const chunks = []
  try {
    for await (const chunk of ipfs.cat(cid, {compress: true})) {
      chunks.push(chunk)
    }
  } catch(e) {
    console.log(e);
    return
  }
  const output = await Buffer.concat(chunks).toString();

  return JSON.parse(output);
}

export async function ipfsGetBufferImg(cid) {
  const chunks = []
  try {
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk)
    }
  } catch(e) {
    console.log(cid);
    return
  }
  const output = await Buffer.concat(chunks);

  return output;
}

