import { fetcher } from '../../lib/fetch';
import { useEffect, useState } from "react";
import Wallet from "../wallets/connect/Wallet";
import solflareLogo from "../../public/solflareLogo.png";

export default function Solflare({ user, walletid, mutate, setIsUpdatingWallets }) {

  const getProvider = () => {
    if ("solflare" in window) {
    const provider = window.solflare;
    if (provider.isSolflare) {
      return provider;
     }
    }
  };

  async function connect() {
    try {
      const resp = await window.solflare.connect();     
    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }
    const provider = getProvider();
    let walletAddr = provider.publicKey.toString();
  
    const response = await fetcher("/api/nonce", {
      method: "GET",
    });

    const nonce = response.nonce;

    const encodedMessage = new TextEncoder().encode(nonce);
    const signature = await solflare.request({
      method: "signMessage",
      params: {
        message: encodedMessage,
      },
    });
    
    setIsUpdatingWallets(true);
    const response1 = await fetcher("/api/wallet/solana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddr: walletAddr,
        signature: JSON.stringify(signature),
        walletName: "solflare"
      }),
    });
    mutate({ user: response1.user }, false);
    return response1.user.solana.solflare;
    if(response1.status = 200) {
        console.log("connected successfully")    
    }
  }

  async function disconnect() {
    window.solflare.disconnect();
    setIsUpdatingWallets(true);
    const response = await fetcher("/api/wallet/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletName: "solflare",
          walletChain: "solana"
        }),
      });
      mutate({ user: response.user }, false);
      return response.user.solana.solflare
      if (response.status == 200) {
        console.log("disconnected wallet successfully")      
      }
  }

  return (
    <div>
      <Wallet name="Solflare" connectFunc={connect} disconnectFunc={disconnect} img={solflareLogo} walletid={walletid}/>      
    </div>
  );
}
