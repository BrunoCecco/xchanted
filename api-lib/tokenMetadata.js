import { ethers } from "ethers";
import CID from "cids";
import sharp from "sharp";
import axios from "axios";
import FormData from 'form-data';
import {ipfsGetJson, ipfsGetBufferImg} from './ipfsget';

import { getMongoClient } from './middlewares/database';
import {findTezosAndUpdate} from './db/user'

const WEB3_ENDPOINT = 'https://speedy-nodes-nyc.moralis.io/5d428256e994984b83a34667/eth/mainnet';
const handleError = () => {
  return "";
};

var myHeaders1 = new Headers();
myHeaders1.append("accept", "application/json");
myHeaders1.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36");
const requestOptions1 = {
  method: 'GET',
  headers: myHeaders1,
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const gtws = [
  "dweb.link",
  "ipfs.moralis.io:2053",
  "infura-ipfs.io",
  "gateway.moralisipfs.com"
]

function convertIpfs(link, type) {
  const rg = gtws[Math.floor(Math.random() * gtws.length)];

  const n = link.match(/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(.*)/gm);    
  if(type == 0) {
    return `https://${rg}/ipfs/` + n;
  } 

  if(type == 1) {
    if(n[0].indexOf("/") != -1 || n[0].indexOf(".") != -1) {
      return `https://${rg}/ipfs/` + n;
    } else {
      let l;
      try {
        l = "https://" + new CID(n[0]).toV1().toString('base32') + ".ipfs.dweb.link";;
      } catch(e) {
        l = `https://${rg}/ipfs/` + n;
      }
      return l;
    }
  }
  if(type == 2) {
    return n;
  }
}

async function getOpenSea(address, id) {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders1,
  };
  const link = `https://api.opensea.io/api/v1/metadata/${address}/${id}`;
  try {
    const d = await fetch(link, requestOptions);
    const c = await d.json();

    return c.image;
  } catch (e) {
    return null;
  } 
}

async function testForVideo(link) {
  const requestOptions = {
    method: 'HEAD',
    redirect: 'follow'
  };
  try {
    const res = await fetch(link, requestOptions);
    const t = res.headers.get('Content-Type');

    if(t.indexOf("video") != -1) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  } 
}
async function testForImg(link) {
  const requestOptions = {
    method: 'HEAD',
    redirect: 'follow'
  };
  try {
    const res = await fetch(link, requestOptions);
    const t = res.headers.get('Content-Type');

    if(t.indexOf("image") != -1) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  } 
}

async function testContent(link) {
  const requestOptions = {
    method: 'HEAD',
    redirect: 'follow'
  };
  try {
    const res = await fetch(link, requestOptions);
    const t = res.headers.get('Content-Type');

    if(t.indexOf("image") != -1) {
      return "i";
    }
    if(t.indexOf("video") != -1) {
      return "v";
    }
    return "";
    
  } catch (e) {
    return false;
  } 
}

async function fetchForData(url) {

  try {
    const r = await axios.get(url, requestOptions1);
    //const md = await d.json();
    return r.data;
  } catch(e) {
    console.log(e);
    return {}
  }

}

export const getTokenMetadataEthereum = async (address, id, userid) => {
  const abi = [
    'function name() view returns (string name)',
    'function symbol() view returns (string symbol)',
    'function tokenURI(uint256 _tokenId) view returns (string URI)'
  ];
  const { JsonRpcProvider } = ethers.providers;
  const provider = new JsonRpcProvider(WEB3_ENDPOINT);
  const contract = new ethers.Contract(address, abi, provider);
  var [name, symbol, metadataLink] = await Promise.all([
    contract.name().catch(handleError),
    contract.symbol().catch(handleError),
    contract.tokenURI(id).catch(handleError),
  ]);
  console.log(name);

  var metadata = {};
  if(metadataLink.indexOf("ipfs") != -1) {
    metadataLink = convertIpfs(metadataLink, 2);
    /*const d = await fetch(metadataLink, requestOptions1);
    const md = await d.json();*/
    const md = await ipfsGetJson(metadataLink);

    if(md.image.indexOf("ipfs") != -1) {
      metadata.image = convertIpfs(md.image, 0);
    } else {
      metadata.image = md.image;
    }
    if(md.animation_url && md.animation_url.indexOf("ipfs") > -1) {
      metadata.animation = convertIpfs(md.animation_url, 0)
    } else if(md.animation_url) {
      metadata.animation = md.animation_url;
    }
    metadata.name = md.name
    metadata.description = md.description
    metadata.traits = md.attributes || md.traits;
    metadata.external_url = md.external_url
  } else if(!isValidHttpUrl(metadataLink)) {
    
    const apiKey = "MVhd9cpoCLTWZ5pEQn-XWTTYHecJCdFx"
    const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTMetadata`;
    const contractAddr = address;
    const tokenId = id;
    const fetchURL = `${baseURL}?contractAddress=${contractAddr}&tokenId=${tokenId}`;

    const md = await fetchForData(fetchURL);

    metadata.name = md.title;
    metadata.description = md.metadata.description;
    metadata.image = md.metadata.image;
    if(md.metadata.image && md.metadata.image.indexOf("ipfs") != -1 ) {
      metadata.image = convertIpfs(md.metadata.image, 0);
    }
    if(md.metadata.animation_url && md.metadata.animation_url.indexOf("ipfs") != -1) {
      metadata.animation = convertIpfs(md.metadata.animation_url, 0)
    } else if(md.metadata.animation_url) {
      metadata.animation = md.metadata.animation_url;
    }
    metadata.traits = md.metadata.attributes;
    metadata.external_url = md.metadata.external_url;

    /*const d = await fetch(`https://api.opensea.io/api/v1/asset/${address}/${id}?format=json`, requestOptions1);
    const c = await d.json();
    metadata = {
      name: c.name,
      description: c.description,
      image: c.image_url,
      animation: c.animation_url,
      traits: c.traits,
      external_url: c.external_url
    }*/
  } else {
    const md = await fetchForData(metadataLink);

    if(md.image.indexOf("ipfs") != -1) {
      metadata.image = convertIpfs(md.image, 0);
    } else {
      metadata.image = md.image;
    }
    if(md.animation_url && md.animation_url.indexOf("ipfs") != -1) {
      metadata.animation = convertIpfs(md.animation_url, 0)
    } else if(md.animation_url) {
      metadata.animation = md.animation_url;
    }
    metadata.name = md.name;
    metadata.description = md.description;
    metadata.traits = md.attributes || md.traits;
    metadata.external_url = md.external_url;
  }

  if(typeof metadata.traits === 'object' && !Array.isArray(metadata.traits) && metadata.traits !== null) {
    metadata.traits = Object.entries(metadata.traits).map((e) => ( 
      { 
        "trait_type": e[0],
        "value": e[1] 
      }));
  }

  const video = await testForVideo(metadata.image);
  if(video) {
    metadata.type = "v";
  }

  const opti = await getOpenSea(address, id);
  if(opti != null) {
    metadata.imgopti = opti;
  }

  let _id = String(address) + "-" + String(id);
  return { _id: _id, name: name || metadata.name, symbol: symbol, chain: 0, metadata };
};

export const getTokenMetadataBinance = async (address, id, userid) => {
  const abi = [
    'function name() view returns (string name)',
    'function symbol() view returns (string symbol)',
    'function tokenURI(uint256 _tokenId) view returns (string URI)'
  ];
  const { JsonRpcProvider } = ethers.providers;
  const provider = new JsonRpcProvider("https://speedy-nodes-nyc.moralis.io/5d428256e994984b83a34667/bsc/mainnet",{ name: 'binance', chainId: 56 });
  const contract = new ethers.Contract(address, abi, provider);
  var [name, symbol, metadataLink] = await Promise.all([
    contract.name().catch(handleError),
    contract.symbol().catch(handleError),
    contract.tokenURI(id).catch(handleError),
  ]);

  var metadata = {};
  if(metadataLink.indexOf("ipfs") != -1) {
    metadataLink = convertIpfs(metadataLink, 2);
    /*const d = await fetch(metadataLink, requestOptions1);
    const md = await d.json();*/
    const md = await ipfsGetJson(metadataLink);

    if(md.image.indexOf("ipfs") != -1) {
      metadata.image = convertIpfs(md.image, 0);
    } else {
      metadata.image = md.image;
    }
    if(md.animation_url && md.animation_url.indexOf("ipfs") > -1) {
      metadata.animation = convertIpfs(md.animation_url, 0)
    } else if(md.animation_url) {
      metadata.animation = md.animation_url;
    }
    metadata.name = md.name
    metadata.description = md.description
    metadata.traits = md.attributes || md.traits;
    metadata.external_url = md.external_url
  } else if(!isValidHttpUrl(metadataLink)) {
    
    const apiKey = "MVhd9cpoCLTWZ5pEQn-XWTTYHecJCdFx"
    const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTMetadata`;
    const contractAddr = address;
    const tokenId = id;
    const fetchURL = `${baseURL}?contractAddress=${contractAddr}&tokenId=${tokenId}`;

    const md = await fetchForData(fetchURL);

    metadata.name = md.title;
    metadata.description = md.metadata.description;
    metadata.image = md.metadata.image;
    if(md.metadata.image && md.metadata.image.indexOf("ipfs") != -1 ) {
      metadata.image = convertIpfs(md.metadata.image, 0);
    }
    if(md.metadata.animation_url && md.metadata.animation_url.indexOf("ipfs") != -1) {
      metadata.animation = convertIpfs(md.metadata.animation_url, 0)
    } else if(md.metadata.animation_url) {
      metadata.animation = md.metadata.animation_url;
    }
    metadata.traits = md.metadata.attributes;
    metadata.external_url = md.metadata.external_url;

    /*const d = await fetch(`https://api.opensea.io/api/v1/asset/${address}/${id}?format=json`, requestOptions1);
    const c = await d.json();
    metadata = {
      name: c.name,
      description: c.description,
      image: c.image_url,
      animation: c.animation_url,
      traits: c.traits,
      external_url: c.external_url
    }*/
  } else {
    const md = await fetchForData(metadataLink);

    if(md.image.indexOf("ipfs") != -1) {
      metadata.image = convertIpfs(md.image, 0);
    } else {
      metadata.image = md.image;
    }
    if(md.animation_url && md.animation_url.indexOf("ipfs") != -1) {
      metadata.animation = convertIpfs(md.animation_url, 0)
    } else if(md.animation_url) {
      metadata.animation = md.animation_url;
    }
    metadata.name = md.name;
    metadata.description = md.description;
    metadata.traits = md.attributes || md.traits;
    metadata.external_url = md.external_url;
  }

  if(typeof metadata.traits === 'object' && !Array.isArray(metadata.traits) && metadata.traits !== null) {
    metadata.traits = Object.entries(metadata.traits).map((e) => ( 
      { 
        "trait_type": e[0],
        "value": e[1] 
      }));
  }

  const video = await testForVideo(metadata.image);
  if(video) {
    metadata.type = "v";
  }

  let _id = String(address) + "-" + String(id);
  return { _id: _id, name: name || metadata.name, symbol: symbol, chain: 3, metadata };
};

export const getTokenMetadataSolana = async (address, mint, key, data, userid) => {

  const c = await fetchForData(address);

  var metadata = {
    name: c.name,
    description: c.description,
    image: c.image,
    animation: c.animation_url,
    traits: c.attributes,
    external_url: c.external_url
  }
  let _id = String(mint) + "-" + String(key);
  return {_id: _id, name: data.name, symbol: data.symbol, chain: 3, metadata};
}

export const fixTokenMetadataTezos = async (md, userid) => {

  var metadata = {};

  if(md.artifact_uri && md.artifact_uri.indexOf("fxhash") != -1 && md.artifact_uri.indexOf("ipfs") != -1) {
    metadata.animation = "https://gateway.fxhash2.xyz/ipfs/" + md.artifact_uri.slice(7);
    if(md.display_uri) {
      metadata.display_uri = "https://gateway.fxhash2.xyz/ipfs/" + md.display_uri.slice(7);
    }
    metadata.image = "https://gateway.fxhash2.xyz/ipfs/" + md.thumbnail_uri.slice(7);
  } else if(md.artifact_uri && md.artifact_uri.indexOf("ipfs") != -1) {
    if(md.display_uri) {
      metadata.image = convertIpfs(md.display_uri, 0).toString();
      metadata.animation = convertIpfs(md.artifact_uri, 0).toString();
    } else {
      metadata.image = convertIpfs(md.artifact_uri, 0).toString();
    }
  } else {
    if(md.display_uri) {
      metadata.image = md.display_uri;
      metadata.animation = md.artifact_uri;
    } else {
      metadata.image = md.artifact_uri;
    }
  }

  let _id = String(md.contract) + "-" + String(md.token_id);

  const contentType = await testContent(convertIpfs(md.artifact_uri, 1));
  //const vid = await testForVideo(convertIpfs(md.artifact_uri, 1));
  if(contentType) {
    //optimizeTezos(convertIpfs(md.artifact_uri, 2), _id);
    metadata.type = contentType;
  }

  metadata.name = md.name
  metadata.description = md.description
  metadata.traits = md.tags
  
  return {_id: _id, name: md.name, symbol: md.symbol, chain: 2, metadata};
}



async function optimizeTezos(link, id) {
  /*const random = Math.floor(Math.random() * ipfsGates.length);
  link = "https://" + ipfsGates[random] + link.substring(17);*/

  const input = await downloadIpfsImg(link);
  
  if(input) {
    try {
      const output = await sharp(input).resize(1080).png().toBuffer()
    
      const img = output.toString('base64');
      console.log("lets go");
      const link = await upload(img, id);
      return link;
    } catch(e) {
      console.log("optimize fail")
      return "";
    }
  }
}

async function downloadIpfsImg(link) {
  try {
    await new Promise(resolve => setTimeout(resolve, Math.random()*10000));
    const input = await ipfsGetBufferImg(link);
    return input;
  } catch(e) {
    console.log("ipfs img download fail")
    return null;
  }
}

async function upload(img, id) {
  try { 
    var data = new FormData();
    data.append('image', img);
    
    var config = {
      method: 'post',
      url: 'https://api.imgur.com/3/image',
      headers: { 
        'Authorization': 'Client-ID e2665165219bc97', 
        ...data.getHeaders()
      },
      data : data
    };
    
    const res = await axios(config);
    const d = res.data;

    const dbClient = await getMongoClient();
    const db = dbClient.db();

    const result = await findTezosAndUpdate(db, id, d.data.link);
    console.log(result);

    return d.data.link;
  } catch(e) {
    console.log("upload fail")
    return null;
  }
  
}

