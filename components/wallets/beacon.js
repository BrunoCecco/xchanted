import { fetcher } from '../../lib/fetch';
import { useEffect, useState } from "react";
import { DAppClient, PermissionScope, SigningType } from "@airgap/beacon-sdk";
import Wallet from "../wallets/connect/Wallet";
import beaconLogo from "../../public/beaconLogo.jpg";

export default function Beacon({ user, walletid, chain, mutate, setIsUpdatingWallets }) {
  async function connect() {
    const dAppClient = new DAppClient({ name: "Beacon" });

    const activeAccount = await dAppClient.getActiveAccount();
    if (activeAccount) {
      // User already has account connected, everything is ready
      console.log("connected:", activeAccount);

      const res = await fetcher("/api/nonce", {
        method: "GET",
      });
      const nonce = res.nonce;

      String.prototype.hexEncode = function(){
        var hex, i;
        var result = "";
        for (i=0; i<this.length; i++) {
            hex = this.charCodeAt(i).toString(16);
            result += ("000"+hex).slice(-4);
        }
    
        return result
      }
      const response = await dAppClient.requestSignPayload({
        signingType: SigningType.MICHELINE,
        payload: "05" + nonce.hexEncode(),
      });
      
      console.log(`Signature: ${response.signature}`);
      setIsUpdatingWallets(true)

      const response1 = await fetcher("/api/wallet/tezos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddr: activeAccount.address,
          publicKey: activeAccount.publicKey,
          signature: response.signature,
          walletName: "beacon"
        }),
      });
      mutate({ user: response1.user }, false);
      return response1.user.tezos.beacon;
      if(response1.status = 200) {
        console.log("connected successfully")      
      }

    } else {
      console.log("Not connected!");
      const scopes = [
        PermissionScope.SIGN,
      ];
      
      try {
        console.log("Requesting permissions...");
        const permissions = await dAppClient.requestPermissions({scopes});
        console.log("Got permissions:", permissions.address);
      } catch (error) {
        console.log("Got error:", error);
      }
    }

  }

  async function disconnect() {
    setIsUpdatingWallets(true)
    const response = await fetcher("/api/wallet/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletName: "beacon",
        walletChain: chain
      }),
    });
    mutate({ user: response.user }, false);
    return response.user[chain].beacon
    if (response.status == 200) {
      console.log("disconnected wallet successfully")      
    }    
  }

  return (
    <>
      <Wallet name="Beacon" connectFunc={connect} disconnectFunc={disconnect} img={beaconLogo} walletid={walletid}/> 
    </>
  //   <div>
  //     <label className="inline">Beacon:</label>
  //     {isConnected ? (
  //       <button
  //       className="bg-green-500 text-white mb-5 font-bold py-2 px-4 rounded"
  //       onClick={connect}
  //       disabled
  //     >
  //       Active
  //     </button>
  //     ) : (
  //       window.solana ? (
  //         <>
  //           <button
  //             className="bg-primary hover:bg-secondary text-white mb-5 font-bold py-2 px-4 rounded"
  //             onClick={connect}
  //           >
  //             Connect
  //           </button>          
  //         </>
  //       ) : (
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           className="inline icon icon-tabler icon-tabler-circle-x"
  //           width="24"
  //           height="24"
  //           viewBox="0 0 24 24"
  //           strokeWidth="2"
  //           stroke="currentColor"
  //           fill="none"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         >
  //           <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  //           <circle cx="12" cy="12" r="9"></circle>
  //           <path d="M10 10l4 4m0 -4l-4 4"></path>
  //         </svg>
  //       )
  //     )
  //     }
      
  //   </div>
  );
}
