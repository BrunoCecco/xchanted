import Link from "next/link";
import Nav from "./nav";
import { fetcher } from '../../lib/fetch';
import { useCurrentUser } from "../../lib/user";
import { useCallback } from "react";
import Image from 'next/image'
import Logo from '../public/logo.png'

const SignOut = ({ mutate }) => {

  const onSignOut = useCallback(async () => {
    try {
      await fetcher('/api/auth', {
        method: 'DELETE',
      });
      //toast.success('You have been signed out');
      mutate({ user: null });
    } catch (e) {
      //toast.error(e.message);
    }
  }, [mutate]);

  return (
    <button onClick={onSignOut} className="sm:inline-flex sm:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-secondary hover:text-white ">
      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-logout" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
        <path d="M7 12h14l-3 -3m0 6l3 -3"></path>
      </svg>
    </button>
  );
};

export default function Header() {
  const { data: { user } = {}, mutate } = useCurrentUser();

  return (
    <div className="flex items-center flex-wrap bg-primary p-3 space-x-5">
      <Image className="absolute left-0" width={300/1.2} height={100/1.2} src={Logo} alt="logo" />
      <Nav />
      {user ? (
        <>
          <Link href="/account">
            <a className="sm:inline-flex sm:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-secondary hover:text-white ">
              Account
            </a>
          </Link>
          <Link href={`/@${user.username}`}>
            <a className="sm:inline-flex sm:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-secondary hover:text-white ">
              Profile
            </a>
          </Link>
          <SignOut mutate={mutate} />
        </>
      ) : (
        <div className="sm:inline-flex">
          <div className="sm:inline-flex sm:flex-row  sm:items-center items-start  flex flex-col sm:h-auto">
            <Link href="/sign-in">
              <a className="sm:inline-flex sm:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-secondary hover:text-white ">
                Login
              </a>
            </Link>
            <Link href="/sign-up">
              <a className="sm:inline-flex sm:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-secondary hover:text-white">
                Register
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
