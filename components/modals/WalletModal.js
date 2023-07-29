import { useState, useEffect, useRef, useCallback } from "react";
import { useCurrentUser } from "../../lib/user";
import { fetcher } from "../../lib/fetch";
import { IoIosClose } from "react-icons/io";
import { useWeb3React } from "@web3-react/core";
import { connectors } from "../../lib/connectors";

export default function WalletModal() {
  const [open, setOpen] = useState(false);
  const { library, activate, deactivate, active, account } = useWeb3React();

  const openModal = () => {
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  useEffect(() => {
    console.log(account);
  }, [account]);

  useEffect(() => {
    const signMessage = async () => {
      if (!library) return;
      try {
        const signature = await library.provider.request({
          method: "personal_sign",
          params: ["AFJIAJSFI", account],
        });
      } catch (e) {
        console.log(e);
      }
    };

    if (active && account) {
      signMessage();
    }
  }, [account, active, library]);

  return open ? (
    <div
      className={`overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`}
      style={{ width: "50vw" }}
    >
      <div className="relative w-full h-full md:h-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 lg:text-2xl dark:text-white">
              Add Another Ethereum Wallet
            </h3>
            <button
              onClick={close}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <IoIosClose size={40} />
            </button>
          </div>
          <div className="p-6 space-y-6 flex flex-wrap">
            <button
              onClick={() => {
                activate(connectors.coinbaseWallet);
                close();
              }}
              w="100%"
            >
              Coinbase
            </button>
            <button
              onClick={() => {
                activate(connectors.injected);
                close();
              }}
              w="100%"
            >
              Metamask
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div onClick={openModal}>+</div>
  );
}
