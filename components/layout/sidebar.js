import React, { useState, useCallback, useEffect, useRef } from "react";
import { HiMail } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import { AiOutlineSearch } from "react-icons/ai";
import { MdSettings } from "react-icons/md";
import Link from "next/link";
import toast from "react-hot-toast";
import { fetcher } from "../../lib/fetch";

const style = {
	headerItem: `font-poppins w-fit font-bold text-txt-3 hover:opacity-75 cursor-pointer`,
	headerIcon: `text-txt-3 text-2xl w-fit hover:opacity-75 cursor-pointer`,
};

export default function Sidebar({ open, openFunc, user, mutate, router }) {
	const [profilePic, setProfilePic] = useState(
		user?.profilePicture?.data?.metadata
	);
	const sidebarRef = useRef(null);

	useEffect(() => {
		setProfilePic(user?.profilePicture?.data?.metadata);
	}, [user]);

	const signOut = useCallback(async () => {
		try {
			await fetcher("/api/auth", {
				method: "DELETE",
			});
			toast.success("You have been signed out");
			mutate({ user: null });
			openFunc(false);
			router.replace("/sign-in");
		} catch (e) {
			toast.error(e.message);
		}
	}, [mutate]);

	const openProfileTab = (tab) => {
		localStorage.setItem("activeTab", tab);
		router.replace("/account");
	};

	return (
		<div
			className={`transition-all z-50 fixed ease-in-out duration-300 m-0 right-0 top-0 bg-bkg-2 items-center shadow-lg w-max overflow-hidden ${
				open
					? `opacity-100 max-w-[500px] h-screen`
					: `opacity-50 max-w-0 h-0`
			}`}
			ref={sidebarRef}
		>
			<div className="flex flex-col gap-2">
				<div className="flex w-full">
					<div className="p-2 pb-0">
						<IoMdClose
							className={style.headerIcon}
							onClick={() => {
								openFunc(!open);
							}}
						/>
					</div>
					<div
						className="w-full p-2"
						onClick={() => openFunc(false)}
					></div>
				</div>
				<div className="flex justify-between gap-4 px-4">
					<div className="flex flex-col gap-2">
						<div className={`md:hidden pl-4 ${style.headerItem}`}>
							<Link href={`/lounge`} passHref>
								<a>The Lounge</a>
							</Link>
						</div>
						<div className={`md:hidden pl-4 ${style.headerItem}`}>
							<Link href={`/trending`} passHref>
								<a>Trending</a>
							</Link>
						</div>
						<div className={`md:hidden pl-4 ${style.headerItem}`}>
							<Link href={`/chats`} passHref>
								<a>Chats</a>
							</Link>
						</div>
						<div
							className="flex gap-2 items-center text-xl relative cursor-pointer"
							onClick={() => openProfileTab(0)}
						>
							<MdSettings className="hidden md:block" />
							<div>Settings</div>
						</div>
						<div
							className={`md:pl-10 pl-4 ${style.headerItem}`}
							onClick={() => openProfileTab(0)}
						>
							Profile
						</div>
						<div
							className={`md:pl-10 pl-4 ${style.headerItem}`}
							onClick={() => openProfileTab(1)}
						>
							Wallet
						</div>
						<div
							className={`md:pl-10 pl-4 ${style.headerItem} coming-soon`}
						>
							QR Code
						</div>
						<div
							className={`md:pl-10 pl-4 ${style.headerItem} coming-soon`}
						>
							Permissions
						</div>
						<div
							className={`md:pl-10 pl-4 ${style.headerItem}`}
							onClick={signOut}
						>
							Sign out
						</div>
					</div>
					<Link href={`/@${user?.username}`} passHref>
						<div
							className="cursor-pointer bg-cover bg-center w-16 h-16 m-1 rounded-lg hover:scale-110 transition-all duration-200 ease-in-out"
							style={{
								backgroundImage: `url(${
									profilePic?.imgopti ??
									profilePic?.image ??
									null
								})`,
							}}
						>
							{profilePic?.image || profilePic?.imgopti ? null : (
								<CgProfile />
							)}
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}
