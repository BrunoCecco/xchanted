import { getTokenMetadataEthereum, getTokenMetadataSolana, fixTokenMetadataTezos, getTokenMetadataBinance } from '../api-lib/tokenMetadata';
import { clusterApiUrl } from "@solana/web3.js";
import { getParsedNftAccountsByOwner,isValidSolanaAddress, createConnectionConfig,} from "@nfteyez/sol-rayz";

export async function getNfts(user) {

  async function getNftsEthereum(address) {
    var headers = new Headers();
    headers.append("accept", "application/json");
    headers.append("X-API-Key", "5mdsCerQICrOjRXSweSBn3QZmlKhiiZSawl41CDEv4QAPZ7EIt9rxR29Abd1TTvU");
  
    var requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    };
  
    const data = await fetch(`https://deep-index.moralis.io/api/v2/${address}/nft?chain=eth&format=decimal`, requestOptions);
    const collection = await data.json();
  
    return collection.result || [];
  }

  async function getNftsBinance(address) {
    var headers = new Headers();
    headers.append("accept", "application/json");
    headers.append("X-API-Key", "5mdsCerQICrOjRXSweSBn3QZmlKhiiZSawl41CDEv4QAPZ7EIt9rxR29Abd1TTvU");
  
    var requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    };
  
    const data = await fetch(`https://deep-index.moralis.io/api/v2/${address}/nft?chain=bsc&format=decimal`, requestOptions);
    const collection = await data.json();
  
    return collection.result || [];
  }

  async function getNftsSolana(address) {
    try {
        const connect = createConnectionConfig(clusterApiUrl("mainnet-beta"));
        let ownerToken = address;
      //  const result = isValidSolanaAddress(ownerToken);
        const nfts = await getParsedNftAccountsByOwner({
          publicAddress: ownerToken,
          connection: connect,
          serialization: true,
        });
        return nfts || [];
      
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async function request50(address, offset) {
    var requestOptions1 = {
      method: "GET",
      headers: {
        Accept: 'application/json',
      }
    };
  
    try {
      const d = await fetch(`https://api.better-call.dev/v1/account/mainnet/${address}/token_balances?size=50&offset=${offset}`, requestOptions1);
      const c = await d.json();
      return c ;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  
  async function getNftsTezos(address) {
  
    let tezosnfts = [];
    let offset = 0;
    const res = await request50(address, offset);
    tezosnfts = tezosnfts.concat(res.balances);
    let numOfRequests = Math.floor(res.total / 50);
    
    var reqPromise = [];
    for (let i = 0; i < numOfRequests; i++) {
      offset += 50;
      reqPromise.push(
        request50(address, offset)
      );
    }
  
    const ress = await Promise.all(reqPromise);
    for (let i = 0; i < ress.length; i++) {
      tezosnfts = tezosnfts.concat(ress[i].balances);
    }
    
    return tezosnfts || [];
  }

  //const eth = user.metamask ? await getNftsEthereum(user) : [];
  let eth = [];
  if(user.ethereum) {
    for(const wallet in user.ethereum) {
      if(user.ethereum[wallet]) {
        const ethNfts = await getNftsEthereum(user.ethereum[wallet]);
        eth = eth.concat(ethNfts);
      }
    }
  }

  //const sol = user.phantom ? await getNftsSolana(user) : [];
  let sol = [];
  if(user.solana) {
    for(const wallet in user.solana) {
      if(user.solana[wallet]) {
        const solNfts = await getNftsSolana(user.solana[wallet]);
        sol = sol.concat(solNfts);
      }
    }
  }

  //const tez = user.beacon ? await getNftsTezos(user) : []; 
  let tez = [];
  if(user.tezos) {
    for(const wallet in user.tezos) {
      if(user.tezos[wallet]) {
        const tezNfts = await getNftsTezos(user.tezos[wallet]);
        tez = tez.concat(tezNfts);
      }
    }
  }

  //const bsc = user.binance ? await getNftsBinance(user) : []; 
  let bsc = [];
  if(user.binance) {
    for(const wallet in user.binance) {
      if(user.binance[wallet]) {
        const bscNfts = await getNftsBinance(user.binance[wallet]);
        bsc = bsc.concat(bscNfts);
      }
    }
  }

  console.log("done1")

  const userid = String(user._id);

  var ethPiecesPromise = [];
  for(let i = 0; i < eth.length; i++) {
    ethPiecesPromise.push(
      getTokenMetadataEthereum(eth[i].token_address, eth[i].token_id, userid)
    );
  }

  var bscPiecesPromise = [];
  for(let i = 0; i < bsc.length; i++) {
    bscPiecesPromise.push(
      getTokenMetadataBinance(bsc[i].token_address, bsc[i].token_id, userid)
    );
  }

  var solPiecesPromise = [];
  for(let i = 0; i < sol.length; i++) {
    solPiecesPromise.push(
      getTokenMetadataSolana(sol[i].data.uri, sol[i].mint, sol[i].key, sol[i].data, userid)
    );
  }
  

  var tezPiecesPromise = [];
  for(let i = 0; i < tez.length; i++) {
    tezPiecesPromise.push(
      fixTokenMetadataTezos(tez[i], userid)
    );
  }

  const tezPieces = await Promise.all(tezPiecesPromise);

  console.log("tez done")

  const bscPieces = await Promise.all(bscPiecesPromise);

  const ethPieces = await Promise.all(ethPiecesPromise);

  console.log("eth done")

  const solPieces = await Promise.all(solPiecesPromise);

  console.log("sol done")

  let collection = [...ethPieces, ...solPieces, ...tezPieces, ...bscPieces];

  console.log(collection.length);

  return collection;

  //finalPieces = finalPieces.slice(0, 50);

}