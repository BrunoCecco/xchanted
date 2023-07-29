import * as IPFS from 'ipfs-core'

const fs = require('fs');

const dir = './ipfsNode/repo.lock/';

console.log(IPFS.repo)

if (fs.existsSync(dir)) {
  console.log('Directory exists!');
} else {
  console.log('Directory not found.');
}

const ipfs = fs.existsSync(dir) ? IPFS.repo : await IPFS.create({ repo: './ipfsNode/' });

setInterval(async () => {
  
  for await (const stats of ipfs.stats.bw()) {
    console.log(stats)
  }

}, 3000);

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

