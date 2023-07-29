import Link from "next/link";

export default function Nav() {
  return (
    <div className="hidden w-full sm:inline-flex sm:flex-grow sm:w-auto">
      <div className="sm:inline-flex sm:flex-row sm:ml-auto sm:w-auto w-full sm:items-center items-start  flex flex-col sm:h-auto">
        <Link href="/">
          <a className="sm:inline-flex sm:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-secondary hover:text-white ">
            The Lounge
          </a>
        </Link>
        <Link href="/">
          <a className="sm:inline-flex sm:w-auto w-full px-3 py-2 rounded text-white font-bold items-center justify-center hover:bg-secondary hover:text-white">
            Trending
          </a>
        </Link>
      </div>
    </div>
  );
}
