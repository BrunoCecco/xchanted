import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiMail } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSettings } from "react-icons/md";
import { BiSun, BiMoon } from "react-icons/bi";
import Sidebar from "./sidebar";
import LogoWhite from "../../public/logoWhite.svg";
import Logo from "../../public/logo.svg";
import { useCurrentUser } from "../../lib/user";
import { Menu, Transition } from "@headlessui/react";
import ClipLoader from "react-spinners/ClipLoader";
import { fetcher } from "../../lib/fetch";
import { useRouter } from "next/router";
import { SearchIcon } from "@heroicons/react/outline";
import SearchResults from "../elements/SearchResults";

const style = {
	headerItem: `text-sm font-poppins font-bold hover:opacity-75 cursor-pointer text-txt-3`,
	headerIcon: `text-xl hover:opacity-75 cursor-pointer text-txt-3`,
	menuItem: `block p-4 text-sm font-bold cursor-pointer hover:opacity-75 font-poppins`,
};

export default function Header() {
	const { data: { user } = {}, mutate } = useCurrentUser();

	const router = useRouter();
	const [inAccount, setInAccount] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [profilePic, setProfilePic] = useState(
		user?.profilePicture?.data?.metadata?.imgopti
			? user.profilePicture.data?.metadata.imgopti
			: user?.profilePicture?.data?.metadata?.image
	);
	const [query, setQuery] = useState(null);
	const [searchBarActive, setSearchBarActive] = useState(false);
	const [searchResults, setSearchResults] = useState(null);
	const [scrolled, setScrolled] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [darkMode, setDarkMode] = useState(false);

	const changeTheme = (theme) => {
		// On page load or when changing themes, best to add inline in `head` to avoid FOUC
		if (!document.documentElement.classList.contains("dark")) {
			document.documentElement.classList.add("dark");
			setDarkMode(true);
		} else {
			document.documentElement.classList.remove("dark");
			setDarkMode(false);
		}
	};

	async function changeSearchQuery(event) {
		setQuery(event.target.value);
		console.log(event.target.value);
	}

	function openFunc(open) {
		setSidebarOpen(open);
	}

	useEffect(() => {
		const fetchData = async () => {
			if (!query || query == "" || query.length < 3) {
				setSearchResults(null);
				return;
			}
			const response = await fetcher(`/api/search?q=${query}`);
			if (!response.searchResults) return;
			console.log("search results", response.searchResults);

			setSearchResults(response.searchResults);
		};
		fetchData();
	}, [query]);

	useEffect(() => {
		setInAccount(
			window.location.pathname.split("/")[1] == "user" ||
				window.location.pathname.indexOf("-up") > -1
		);
		setProfilePic(
			user?.profilePicture?.data?.metadata?.imgopti
				? user.profilePicture.data?.metadata.imgopti
				: user?.profilePicture?.data?.metadata?.image
		);
		if (typeof window !== undefined) {
			setDarkMode(document.documentElement.classList.contains("dark"));
		}
	});

	if (typeof window !== "undefined") {
		window.addEventListener("locationchange", function () {
			setInAccount(window.location.pathname.split("/")[1] == "user");
		});
		// add scroll event listener
		window.addEventListener("scroll", function () {
			if (window.scrollY > window.innerWidth * 0.22) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		});
	}

	return (
		<>
			<div
				className={`px-8 py-2 flex flex-wrap gap-2 md:flex-nowrap items-center justify-between sticky top-0 z-50 transition duration-200 font-poppins ${
					scrolled ? `backdrop-blur` : `bg-bkg-2`
				} ${
					sidebarOpen ? `max-w-[80vw] justify-start` : `max-w-screen`
				}`}
				onClick={() => {
					if (sidebarOpen) openFunc(false);
				}}
			>
				<Link
					href={`${user?.username ? `/@${user?.username}` : `/`}`}
					passHref
				>
					<a className="min-w-[150px] w-auto min-h-[40px] h-auto relative">
						<Image
							className="cursor-pointer"
							width={200}
							layout="fill"
							src={Logo}
							alt="logo"
						/>
					</a>
				</Link>
				<div
					className="p-1 relative w-[30vw] hidden md:block"
					tabIndex="0"
					onFocus={() => setSearchBarActive(true)}
				>
					<div className="relative">
						<div className="absolute inset-y-0 flex items-center pointer-events-none p-3">
							<SearchIcon className="h-5 w-5 text-txt-3" />
						</div>
						<input
							disabled={false}
							className={`block w-full pl-10 sm:text-sm rounded-full focus:ring-2 ring-1 focus:outline-none focus:shadow-xl font-poppins disabled:opacity-50 disabled:cursor-not-allowed bg-transparent py-2 truncate ring-black text-txt-2 placeholder-txt-4`}
							placeholder="Explore nfts, collections and users"
							onChangeCapture={changeSearchQuery}
						/>
					</div>
					{searchBarActive && searchResults && (
						<SearchResults
							results={searchResults}
							router={router}
							setIsActive={setSearchBarActive}
						/>
					)}
				</div>
				{user === undefined && (
					<ClipLoader
						className="md:flex md:items-center md:justify-between gap-x-8"
						color="#fff"
						loading={user === undefined}
						size={20}
					/>
				)}
				<div
					className={
						user == null && user !== undefined
							? "flex items-center justify-between gap-x-8"
							: "hidden"
					}
				>
					{/* <Link href="/sign-in">
						<a className={style.headerItem}>Sign In</a>
					</Link> */}
					<Link href="/sign-up">
						<a className={style.headerItem}>Early Access</a>
					</Link>
				</div>
				<div
					className={
						user
							? "flex items-center justify-between gap-x-8"
							: "hidden"
					}
				>
					{/* <div
						onClick={changeTheme}
						className="cursor-pointer p-2 rounded-full flex items-center justify-center border-black bg-bkg-3 bg-background hover:opacity-75"
					>
						{darkMode ? <BiSun /> : <BiMoon />}
					</div> */}
					<div className={`hidden md:block ${style.headerItem}`}>
						<Link href={`/lounge`} passHref>
							<a>The Lounge</a>
						</Link>
					</div>
					<div className={`hidden md:block ${style.headerItem}`}>
						<Link href={`/trending`} passHref>
							<a>Trending</a>
						</Link>
					</div>
					<div
						className={`coming-soon hidden md:block ${style.headerIcon}`}
					>
						<HiMail />
					</div>
					{!inAccount && (
						<Link href={`/@${user?.username}`} passHref>
							<div
								className="hidden md:flex bg-cover bg-center w-10 h-10 rounded-lg hover:scale-110 transition-all duration-200 ease-in-out items-center cursor-pointer"
								style={{
									backgroundImage: `url(${
										profilePic ?? null
									})`,
								}}
							>
								{profilePic ? null : <CgProfile />}
							</div>
						</Link>
					)}
					<GiHamburgerMenu
						className={`${style.headerIcon}`}
						onClick={() => {
							setSidebarOpen(!sidebarOpen);
						}}
					/>
				</div>
				<div
					className="p-1 relative w-[80vw] md:hidden block mx-auto"
					tabIndex="0"
					onBlur={() => setSearchBarActive(false)}
					onFocus={() => setSearchBarActive(true)}
				>
					<div className="relative">
						<div className="absolute inset-y-0 flex items-center pointer-events-none p-3">
							<SearchIcon className="h-5 w-5 text-txt-3" />
						</div>
						<input
							disabled={false}
							className={`block w-full pl-10 sm:text-sm rounded-full focus:ring-2 ring-1 focus:outline-none focus:shadow-xl font-poppins disabled:opacity-50 disabled:cursor-not-allowed bg-transparent py-2 truncate ring-black text-txt-3 placeholder-gray-500`}
							placeholder="Explore nfts, collections and users"
							onChangeCapture={changeSearchQuery}
						/>
					</div>
					{searchBarActive && searchResults && (
						<SearchResults
							results={searchResults}
							router={router}
							setIsActive={setSearchBarActive}
						/>
					)}
				</div>
			</div>
			<Sidebar
				open={sidebarOpen}
				openFunc={openFunc}
				user={user}
				mutate={mutate}
				router={router}
			/>
		</>
	);
}
