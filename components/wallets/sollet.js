import { fetcher } from '../../lib/fetch';
import { useEffect, useState } from "react";
import Wallet from "../wallets/connect/Wallet";
import solletLogo from "../../public/sollet.webp";
// import {Wallet as SolWallet} from '@project-serum/sol-wallet-adapter';

export default function Sollet({ user, walletid }) {

  async function connect() {
    let providerUrl = window.sollet;
    let wallet = new SolWallet(providerUrl);
    wallet.on('connect', async (publicKey) => {
        console.log('Connected to ' + publicKey.toString())

        const response = await fetcher("/api/nonce", {
            method: "GET",
          });
      
          const nonce = response.nonce;

          const data = new TextEncoder().encode(nonce);
          let { signature } = await wallet.sign(data, 'utf8');
          console.log(JSON.stringify(signature.toJSON()))

          const response1 = await fetcher("/api/wallet/solana", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddr: publicKey.toString(),
              signature: JSON.stringify(signature.toJSON()),
              walletName: "sollet"
            }),
          });

          if(response1.status = 200) {
            console.log("connected successfully")
          }        

    });
    
    await wallet.connect();
  }


    async function disconnect() {
        const response = await fetcher("/api/wallet/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletName: "sollet",
              walletChain: "solana"
            }),
          });
          if (response.status == 200) {
            console.log("disconnected wallet successfully")  
            return;    
          }
    }

  return (
    <div>
      <Wallet name="Sollet" connectFunc={connect} disconnectFunc={disconnect} img={solletLogo} walletid={walletid}/>      
    </div>
  );
}
