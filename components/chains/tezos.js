import Beacon from "../wallets/beacon";

export default function Tezos({ user, mutate, setIsUpdatingWallets }) {
  const possibleWallets = [
    <Beacon
      key={1}
      user={user}
      walletid={user.tezos?.beacon}
      chain="tezos"
      mutate={mutate}
      setIsUpdatingWallets={setIsUpdatingWallets}
    />,
  ];
  return (
    <>
      {possibleWallets.map((n, id) => (
        <div key={id}>{n}</div>
      ))}

      {/* <h5>Tezos</h5>
      <div className="ml-4">  
        <Beacon user={user} />
      </div> */}
    </>
  );
}
