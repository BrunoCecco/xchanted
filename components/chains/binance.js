import WalletConnect from "../wallets/walletConnect";
import MetaMask from "../wallets/metamask";
import React from "react";

export default function Binance({ user, mutate, setIsUpdatingWallets }) {
  //will contain their own list of every wallet this blockchain allows for

  const possibleWallets = [
    <MetaMask
      key={1}
      user={user}
      walletid={user.binance?.metamask}
      chain="binance"
      mutate={mutate}
      setIsUpdatingWallets={setIsUpdatingWallets}
    />,
    <WalletConnect
      key={2}
      user={user}
      walletid={user.binance?.walletconnect}
      chain="binance"
      mutate={mutate}
      setIsUpdatingWallets={setIsUpdatingWallets}
    />,
  ];

  return (
    <>
      {possibleWallets.map((n, id) => (
        <div key={id}>{n}</div>
      ))}
      {/* <h5>Binance Smart Chain</h5>
      <div className="ml-4">  
        <WalletConnect user={user} />
      </div> */}
    </>
  );
}
