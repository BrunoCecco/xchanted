import { ethers } from "ethers";
import { fetcher } from '../../lib/fetch';
import { useEffect, useState } from "react";
import Wallet from "../wallets/connect/Wallet";
import metamaskLogo from "../../public/metamasklogo.png"

export default function MetaMask({ user, walletid, chain, mutate, setIsUpdatingWallets}) {

  async function connect() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const walletAddr = await signer.getAddress();
  
    const response = await fetcher("/api/nonce", {
      method: "GET",
    });

    const nonce = response.nonce;

    const signature = await signer.signMessage(nonce);

    setIsUpdatingWallets(true)
    const response1 = await fetcher("/api/wallet/" + chain, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddr: walletAddr,
        signature: signature,
        walletName: "metamask"
      }),
    });
    mutate({ user: response1.user }, false);
    return response1.user[chain].metamask
    if(response1.status = 200) {      
      console.log("connected successfully")
    }
  }

  async function disconnect() {
    setIsUpdatingWallets(true)
    const response = await fetcher("/api/wallet/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletName: "metamask",
        walletChain: chain
      }),
    });
    mutate({ user: response.user }, false);
    return response.user[chain].metamask
    if (response.status == 200) {
      console.log("disconnected wallet successfully")      
    }
  }

  //should loop through and render each wallet,
  return (
    <div>
      <Wallet name="MetaMask" connectFunc={connect} disconnectFunc={disconnect} img={metamaskLogo} walletid={walletid}/>
    </div>
  );
}
