import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetcher } from "../../lib/fetch";
import Button from "../../components/elements/Button";

const styles = {
	button: `justify-center outline outline-1 rounded-xl font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center hover:bg-primary hover:text-white`,
	buttonActive: `text-white ring-2 bg-primary ring-black outline-none`,
	collectionsButton: `ring-2 ring-black outline-none rounded-full h-12 w-12`,
};

const CollectionDisplay = ({ userCollections, selCols, setSelCols }) => {
	const handleSelectedCol = (collection) => {
		console.log(selCols);
		if (selCols?.length > 0 && selCols?.find((col) => col === collection)) {
			//remove it
			console.log("removing...");
			let selColsCopy = selCols.filter((c) => c != collection);
			setSelCols(selColsCopy);
		} else {
			console.log("adding to selected collction...");
			setSelCols((selCols) => [...selCols, collection]);
		}
	};

	return (
		<div className="grid grid-cols-3 gap-4 bg-white overflow-y-auto max-h-56 p-3">
			{userCollections.map.length > 0 &&
				userCollections.map((col) => (
					<button
						onClick={() => handleSelectedCol(col._id)}
						className={
							selCols?.find((c) => c === col._id)
								? `${styles.collectionsButton}`
								: null
						}
						key={col._id}
					>
						<div
							className="h-12 w-12 rounded-full overflow-hidden bg-center bg-cover"
							style={{
								backgroundImage: `url(${col.image_url})`,
							}}
						/>
					</button>
				))}
		</div>
	);
};

const Permissions = ({ user }) => {
	const [showChats, setShowChats] = useState(false);
	const [showChants, setShowChants] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const [chatSettings, setChatSettings] = useState(null);
	const [chantSettings, setChantSettings] = useState(null);
	const [commentSettings, setCommentSettings] = useState(null);
	const [selChatCols, setSelChatCols] = useState([]);
	const [selChantsCols, setSelChantsCols] = useState([]);
	const [selCommentsCols, setSelCommentsCols] = useState([]);
	const [userCollections, setUserCollections] = useState([]);

	const handleChatsClicked = () => {
		setShowChats(!showChats);
		setChatSettings(2);
	};

	const handleChantsClicked = () => {
		setShowChants(!showChants);
		setChantSettings(2);
	};

	const handleCommentsClicked = () => {
		setShowComments(!showComments);
		setCommentSettings(2);
	};

	const handleSave = () => {
		const updateP = async () => {
			try {
				const r = await fetcher("/api/chats/permissions", {
					method: "PATCH",
					body: JSON.stringify({
						userid: user._id.toString(),
						chatP: chatSettings,
						chantP: chantSettings,
						commentP: commentSettings,
						chatCols: selChatCols,
						chantCols: selChantsCols,
						commentCols: selCommentsCols,
					}),
				});
			} catch (err) {
				console.log("error: ", err);
			}
		};
		updateP().then(() => {
			toast.success("Saved!");
		});
	};

	//Collections
	const uniqueItems = [...new Set(user.nfts)];
	const collectionIds = uniqueItems.map((item) =>
		item ? item.match(/.+?(?=-)/g)[0] : null
	);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetcher("/api/collection/getByIds", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						collectionIds: collectionIds,
					}),
				});
				setUserCollections(JSON.parse(res));
			} catch (error) {
				console.log("error", error);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		//obtain the permissions object from the database
		const fetchPermissions = async () => {
			try {
				const res = await fetcher("/api/chats/permissions", {
					method: "POST",
					body: JSON.stringify({
						userid: user._id.toString(),
					}),
				});
				return res;
			} catch (err) {
				console.log("error getting permissions", err);
			}
		};
		fetchPermissions().then((res) => {
			if (!res.r.permissions) {
				//no permissions, default all are 1s
				setChatSettings(1);
				setCommentSettings(1);
				setChantSettings(1);
				setSelChatCols([]);
				setSelChantsCols([]);
				setSelCommentsCols([]);
			} else {
				setChatSettings(res.r.permissions?.chats);
				setCommentSettings(res.r.permissions?.comments);
				setChantSettings(res.r.permissions?.chants);
				setSelChatCols(res.r.permissions?.chatCol);
				setSelChantsCols(res.r.permissions?.chantCol);
				setSelCommentsCols(res.r.permissions?.commentCol);
			}
		});
	}, []);

	return (
		<div className="flex md:flex-nowrap flex-wrap justify-center items-center bg-grey w-full p-8 rounded-2xl relative">
			<div className="grid grid-cols-3">
				<div className="col-span-3 flex justify-between items-center">
					<div className="text-2xl font-bold">
						Who can reach out to you?
					</div>
					<Button onClick={handleSave} text="Save" />
				</div>
				<section className="col-span-3 mt-10">
					<h1 className="text-2xl p-3">Chats</h1>
					<div className="grid grid-flow-row-dense grid-cols-3 gap-20 w-full text-gray-500">
						<button
							onClick={() => {
								setChatSettings(1);
								console.log("chat settings to 1");
							}}
							className={`${styles.button} ${
								chatSettings == 1 ? styles.buttonActive : null
							}`}
						>
							Everyone
						</button>
						<div classame="flex flex-1">
							<button
								onClick={handleChatsClicked}
								className={`${styles.button} relative ${
									chatSettings == 2
										? styles.buttonActive
										: null
								}`}
								id="dropdownChats"
								data-dropdown-toggle="dropdownChats"
							>
								Only specific holders
								<svg
									className="w-4 h-4 ml-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</button>
							{showChats && chatSettings == 2 && selChatCols ? (
								<div
									id="dropdownChats"
									className=" absolute t-0 z-10 w-52 p-2 rounded shadow-xl"
								>
									<CollectionDisplay
										userCollections={userCollections}
										selCols={selChatCols}
										setSelCols={setSelChatCols}
									/>
								</div>
							) : (
								<></>
							)}
						</div>
						<button
							onClick={() => {
								setChatSettings(3);
								console.log("chat settings to 3");
							}}
							className={`${styles.button} ${
								chatSettings == 3 ? styles.buttonActive : null
							}`}
						>
							Only people you follow
						</button>
					</div>
				</section>
				<section className="col-span-3 mt-10">
					<h1 className="text-2xl p-3">Chants</h1>
					<div className="grid grid-flow-row-dense grid-cols-3 gap-20 w-full text-gray-500">
						<button
							onClick={() => {
								setChantSettings(1);
								console.log("chant settings to 1");
							}}
							className={`${styles.button} ${
								chantSettings == 1 ? styles.buttonActive : null
							}`}
						>
							Everyone
						</button>
						<div classame="flex flex-1">
							<button
								onClick={handleChantsClicked}
								className={`${styles.button} relative ${
									chantSettings == 2
										? styles.buttonActive
										: null
								}`}
								id="dropdownChants"
								data-dropdown-toggle="dropdownChants"
							>
								Only specific holders
								<svg
									className="w-4 h-4 ml-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</button>
							{showChants &&
							chantSettings == 2 &&
							selChantsCols ? (
								<div
									id="dropdownChants"
									className=" absolute t-0 z-20 w-52 p-2 rounded shadow-xl"
								>
									<CollectionDisplay
										userCollections={userCollections}
										selCols={selChantsCols}
										setSelCols={setSelChantsCols}
									/>
								</div>
							) : (
								<></>
							)}
						</div>
						<button
							onClick={() => {
								setChantSettings(3);
								console.log("chant settings to 3");
							}}
							className={`${styles.button} ${
								chantSettings == 3 ? styles.buttonActive : null
							}`}
						>
							Only people you follow
						</button>
					</div>
				</section>
				<section className="col-span-3 mt-10">
					<h1 className="text-2xl p-3">Comments</h1>
					<div className="grid grid-flow-row-dense grid-cols-3 gap-20 w-full text-gray-500">
						<button
							onClick={() => {
								setCommentSettings(1);
								console.log("comment settings to 1");
							}}
							className={`${styles.button} ${
								commentSettings == 1
									? styles.buttonActive
									: null
							}`}
						>
							Everyone
						</button>
						<div classame="flex flex-1">
							<button
								onClick={handleCommentsClicked}
								className={`${styles.button} relative ${
									commentSettings == 2
										? styles.buttonActive
										: null
								}`}
								id="dropdownComments"
								data-dropdown-toggle="dropdownComments"
							>
								Only specific holders
								<svg
									className="w-4 h-4 ml-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</button>
							{showComments &&
							commentSettings == 2 &&
							selCommentsCols ? (
								<div
									id="dropdownComments"
									className=" absolute t-0 z-30 w-52 p-2 rounded shadow-xl"
								>
									<CollectionDisplay
										userCollections={userCollections}
										selCols={selCommentsCols}
										setSelCols={setSelCommentsCols}
									/>
								</div>
							) : (
								<></>
							)}
						</div>
						<button
							onClick={() => {
								setCommentSettings(3);
								console.log("comment settings to 3");
							}}
							className={`${styles.button} ${
								commentSettings == 3
									? styles.buttonActive
									: null
							}`}
						>
							Only people you follow
						</button>
					</div>
				</section>
			</div>
		</div>
	);
};

export default Permissions;
