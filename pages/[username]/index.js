import nc from "next-connect";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    arrayMove
} from "react-sortable-hoc";
import { incrementUserViewCount } from "../../api-lib/db/analytics";
import { findNfts, findUserByUsernameAgg } from "../../api-lib/db/user";
import { auths, database } from "../../api-lib/middlewares";
import Button from "../../components/elements/Button";
import FollowsLink from "../../components/elements/FollowsLink";
import ProfilePicture from "../../components/elements/ProfilePicture";
import Username from "../../components/elements/Username.js";
import AssetBrowseModal from "../../components/modals/AssetBrowseModal.js";
import GridContainerModal from "../../components/modals/GridContainerModal.js";
import PoapsModal from "../../components/modals/PoapsModal.js";
import ModalService from "../../components/modals/services/ModalService.js";
import TagsModal from "../../components/modals/TagsModal.js";
import NftGrid from "../../components/nft/NftGrid.js";
import NftImage from "../../components/nft/NftImage.js";
import { fetcher } from "../../lib/fetch";
import { useCurrentUser } from "../../lib/user";
import gemImg from "../../public/gem.png";
import linkImg from "../../public/linkicon.png";
import monocleImg from "../../public/monocle.png";
import chatImg from "../../public/speech.png";
import tagImg from "../../public/tag.png";

export default function UserPage({ user }) {
	const router = useRouter();
	const { data, error, mutate } = useCurrentUser();

	const [totalLikes, setTotalLikes] = useState(0);

	const [currUser, setCurrUser] = useState(user);

	const [visible, setVisible] = useState(false);

	const [selectedNFTCards, setSelectedNFTCards] = useState(user.selected);
	const [selectedContainerCards, setSelectedContainerCards] = useState([]);
	const [currContainer, setCurrContainer] = useState({});
	const [tabs, setTabs] = useState([]);
	const [selectedTab, setSelectedTab] = useState("collection");
	const [poaps, setPoaps] = useState(false);
	const [nftGrid, setNftGrid] = useState(user.selected);
	const [grid, setGrid] = useState(null);
	const [isFollowing, setIsFollowing] = useState(
		user.requesterFollowingThisUser
	);

	const defaultW = 3;
	const defaultH = 3;

	useEffect(() => {
		setTotalLikes(getTotalLikes());
	}, []);

	useEffect(() => {
		setNftGrid(user.selected);
	}, [user.selected]);

	useEffect(() => {
		setTabs({
			chants: {
				label: "Chants",
				active: selectedTab == "chants",
				disabled: true,
				img: chatImg,
				click: () => setSelectedTab("chants"),
			},
			collection: {
				label: "Collection",
				active: selectedTab == "collection",
				disabled: false,
				img: gemImg,
				click: () => setSelectedTab("collection"),
			},
			curated: {
				label: "Curated",
				active: selectedTab == "curated",
				disabled: false,
				img: monocleImg,
				click: () => setSelectedTab("curated"),
			},
			tags: {
				label: "Tags",
				active: selectedTab == "tags",
				disabled: true,
				img: tagImg,
				click: () => setSelectedTab("tags"),
			},
		});
	}, [selectedTab]);

	const like = (id) => {
		const nftLiked = nftGrid.map((e) => e._id).indexOf(id);
		if (nftGrid[nftLiked].data.userAppreciated) {
			setTotalLikes(totalLikes - 1 < 0 ? 0 : totalLikes - 1);
			let newNftGrid = nftGrid;
			newNftGrid[nftLiked].data.userAppreciated = false;
			newNftGrid[nftLiked].data.appreciatesNum -= 1;
			setNftGrid(newNftGrid);
		} else {
			setTotalLikes(totalLikes + 1);
			let newNftGrid = nftGrid;
			newNftGrid[nftLiked].data.userAppreciated = true;
			newNftGrid[nftLiked].data.appreciatesNum += 1;
			setNftGrid(newNftGrid);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const poapsResult = await fetcher(
					"/api/profile/poap/" + user._id,
					{
						method: "get",
					}
				);
				setPoaps(poapsResult?.poaps);
			} catch (error) {
				console.log("error", error);
			}
		};

		if (user.ethereum && user.ethereum.length > 0) {
			fetchData();
		}
	}, []);

	const getTotalLikes = () => {
		let total = 0;
		user.selected.forEach((nft) => {
			if (nft.data?.appreciatesNum) {
				total += nft.data?.appreciatesNum;
			}
		});
		return total < 0 ? 0 : total;
	};

	const getNftsInTab = (allNfts) => {
		switch (selectedTab) {
			case "chants":
				return allNfts;
			case "collection":
				return allNfts;
			case "curated":
				return allNfts;
			case "tags":
				return allNfts.filter((n) => {
					return user.tagged.find((el) => {
						return el._id === n._id;
					});
				});
			default:
				return allNfts;
		}
	};

	const open = (item, hasQuery = true, isProfilePicture = false) => {
		if (hasQuery && item._id != null) {
			router.push({
				pathname: "../asset/[id]",
				query: {
					id: item._id,
				},
			});
		}
	};

	const close = () => {
		setVisible(false);
	};

	const follow = async () => {
		try {
			const response = await fetcher("/api/user/follow", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
				}),
			});
			if (response.error) {
				console.log(response.error);
				toast.error(response.error);
				if (response.redirect) {
					router.push(response.redirect);
				}
				return;
			}
			mutate({ user: response.user }, false);
			setIsFollowing(true);
			toast.success("Followed: " + user.username);
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
		}
	};

	const unfollow = async () => {
		try {
			const response = await fetcher("/api/user/follow", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
				}),
			});
			mutate({ user: response.user }, false);
			setIsFollowing(false);
			toast.success("unfollowed: " + user.username);
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
		}
	};

	const onSortEnd = ({ oldIndex, newIndex }) => {
		setNftGrid(arrayMove(nftGrid, oldIndex, newIndex));
	};

	const resize = () => {
		setResizing(!resizing);
	};

	const multiSelect = () => {
		setMultiSelecting(!multiSelecting);
	};

	const hide = async () => {
		let newSelected = nftGrid.filter(
			(el) => !multiSelectedCards.includes(el._id)
		);
		try {
			const response = await fetcher("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					selected: newSelected,
					type: "nft",
				}),
			});
			mutate({ user: response.user }, false);
			setNftGrid(response.user.selected);
			setMultiSelecting(false);
			setMultiSelectedCards([]);
			setSelectedNFTCards(response.user.selected);
			toast.success("Selected items hidden");
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
		}
	};

	function search(searchVal) {
		setNftGrid((nftGrid) =>
			user.selected.filter((nft) => {
				const name = nft.data?.name.toLowerCase();
				const name2 =
					nft.data?.metadata.name == null
						? ""
						: nft.data?.metadata.name.toLowerCase();
				if (
					searchVal.trim() == "" ||
					name?.indexOf(searchVal.toLowerCase()) != -1 ||
					name2?.indexOf(searchVal.toLowerCase()) != -1
				) {
					return nft;
				} else {
					return;
				}
			})
		);
	}

	useEffect(() => {
		// whenever the state changes, update the modals
		ModalService.update({
			setSelectedNFTCards: setSelectedNFTCards,
			selectedNFTCards: selectedNFTCards,
			onSave: addNfts,
		});
	}, [selectedNFTCards]);

	useEffect(() => {
		// whenever the state changes, update the modals
		ModalService.update({
			setSelectedNFTCards: setSelectedContainerCards,
			selectedNFTCards: selectedContainerCards,
			onSave: addNftsToContainer,
		});
	}, [selectedContainerCards]);

	useEffect(() => {
		ModalService.update({
			user: currUser,
			setUser: setCurrUser,
		});
	}, [currUser]);

	useEffect(() => {
		setCurrUser(user);
	}, [user]);

	const modalProps = {
		user: currUser,
		setUser: setCurrUser,
		modalSelectOne: false,
	};

	function showModal() {
		ModalService.open(AssetBrowseModal, {
			...modalProps,
			setSelectedNFTCards: setSelectedNFTCards,
			selectedNFTCards: selectedNFTCards,
			onSave: addNfts,
			heading: "Choose NFTs to add to your profile",
		});
	}

	function showContainerModal() {
		ModalService.open(AssetBrowseModal, {
			...modalProps,
			setSelectedNFTCards: setSelectedContainerCards,
			selectedNFTCards: selectedContainerCards,
			onSave: addNftsToContainer,
			heading: "Choose NFTs to add to this container",
		});
	}

	const newContainer = async () => {
		let numContainers = nftGrid.filter((nft) =>
			nft._id.includes("container")
		).length;
		let contId = "container" + Math.floor(Math.random() * 10000);
		while (nftGrid.map((nft) => nft._id).includes(contId)) {
			contId = "container" + Math.floor(Math.random() * 10000);
		}
		let newSelected = [
			...nftGrid,
			{
				_id: contId,
				gridData: {
					w: defaultW,
					h: defaultH,
					x: -1,
					y: -1,
					i: contId,
				},
				mobileGridData: {
					w: defaultW,
					h: defaultH,
					x: -1,
					y: -1,
					i: contId,
				},
				nfts: [],
			},
		];
		setSelectedContainerCards([]);
		let res = await updateSelected(newSelected);
		toast.success("Container added");
	};

	function editContainer(container) {
		console.log(container);
		setCurrContainer(container);
		ModalService.open(GridContainerModal, {
			...modalProps,
			container: container,
			updateSelected: updateSelected,
			setSelectedNFTCards: setSelectedContainerCards,
			nfts: container.nfts,
			showModal: showContainerModal,
		});
	}

	function showPoaps() {
		ModalService.open(PoapsModal, {
			poaps: poaps,
			user: user,
			back: showPoaps,
		});
	}

	function showTagged() {
		if (
			(user.tagged && user.tagged > 0) ||
			user.bannerDescription != "" ||
			user.bannerTitle != ""
		) {
			ModalService.open(TagsModal, {
				editing: false,
				user: user,
			});
		} else if (user.bannerNFT && user.bannerNFT != null) {
			let nftToOpen = nfts.find((el) => el._id === user.bannerNFT._id);
			open(nftToOpen.data);
		} else {
			toast("No tags for this banner...");
		}
	}

	const addNftsToContainer = async () => {
		let newSelected = nftGrid ? [...nftGrid] : [];
		let containerIndex = newSelected.findIndex(
			(el) => el._id === currContainer._id
		);
		if (containerIndex == -1) return;
		console.log(containerIndex);
		// remove selected container nfts from actual grid and other containers
		let selectedCards = selectedContainerCards.map((el) => el._id);
		// let selectedNoDups = user.selected.map(el => {
		//   if (el._id.includes("container") && el.nfts?.length > 0) {
		//     el.nfts = el.nfts.filter(nft => !selectedCards.includes(nft._id))
		//   }
		//   return el;
		// })
		// console.log(selectedNoDups)
		if (newSelected[containerIndex] && newSelected[containerIndex].nfts) {
			newSelected[containerIndex].nfts = selectedContainerCards.map(
				(card) => {
					if (card.gridData != null && card.data != null) {
						return card;
					} else {
						return {
							_id: card._id,
							gridData: {
								w: defaultW,
								h: defaultH,
								x: -1,
								y: -1,
								i: card._id,
							},
							data: card,
						};
					}
				}
			);
			newSelected = newSelected.filter(
				(el) => !selectedContainerCards.includes(el._id)
			);
		}
		let res = await updateSelected(newSelected);
		editContainer(
			res.user.selected.find((el) => el._id == currContainer._id)
		);
		toast.success("Added nfts to container");
	};

	const addNfts = async () => {
		let newSelected = [];
		for (let i = 0; i < selectedNFTCards.length; i++) {
			if (
				selectedNFTCards[i].gridData != null ||
				selectedNFTCards[i]._id.includes("container")
			) {
				newSelected.push(selectedNFTCards[i]);
			} else {
				newSelected.push({
					_id: selectedNFTCards[i]._id,
					gridData: {
						w: defaultW,
						h: defaultH,
						x: -1,
						y: -1,
						i: selectedNFTCards[i]._id,
					},
					mobileGridData: {
						w: 6,
						h: 6,
						x: -1,
						y: -1,
					},
					data: selectedNFTCards[i],
				});
			}
		}
		let response = await updateSelected(newSelected);
		setNftGrid(response.user.selected);
		setSelectedNFTCards(response.user.selected);
		toast.success("Selected NFTs updated!");
	};

	const updateSelected = async (
		newSelected,
		containerId,
		containerName,
		checkContainerName
	) => {
		if (containerId) {
			let containerSelected = newSelected;
			newSelected = nftGrid ? [...nftGrid] : [];
			if (containerName || checkContainerName) {
				let containerIndex = newSelected.findIndex(
					(el) => el._id.toString() === containerId.toString()
				);
				if (containerIndex > -1) {
					newSelected[containerIndex].name = containerName;
				}
			}
			let containerIndex = newSelected.findIndex(
				(el) => el._id.toString() === containerId.toString()
			);
			if (containerSelected && containerIndex > -1) {
				newSelected[containerIndex]["nfts"] = containerSelected;
			}
		}
		try {
			const response = await fetcher("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					selected: newSelected,
					type: "nft",
				}),
			});
			mutate({ user: response.user }, false);
			setNftGrid(response.user.selected);
			setSelectedNFTCards(response.user.selected);
			return response;
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
			return;
		}
	};

	const style = {
		tab: "cursor-pointer hover:opacity-75",
		tabActive: "cursor-pointer text-gray-500",
	};

	return (
		<div className="w-[100vw]">
			<Head>
				<title>
					{user.name} (@{user.username})
				</title>
			</Head>

			<section className="flex flex-col items-center w-full">
				<div
					className="w-[100vw] h-[30vw] text-center flex justify-center items-center overflow-hidden cursor-pointer bg-cover bg-center bg-gradient-to-b from-secondary"
					style={
						user.banner && !user.bannerNFT
							? { backgroundImage: `url(${user.banner})` }
							: null
					}
					onClick={() => {
						if (user.banner) {
							showTagged();
						}
					}}
				>
					{user.banner?.indexOf(".mp4") > -1 && (
						<video autoPlay muted={true} loop poster={user.banner}>
							<source src={user.banner} type="video/mp4"></source>
						</video>
					)}
					{user.banner ? null : user.bannerNFT ? (
						<NftImage
							metadata={user.bannerNFT.data?.metadata}
							classname="w-full h-full overflow-hidden bg-center bg-cover"
							click={() => open(user.bannerNFT)}
						/>
					) : null}
				</div>
				<div className="w-[80vw] p-8 rounded-2xl bg-white relative -top-[8.4vw] flex flex-col gap-6">
					<div className="flex flex-col md:flex-row items-center md:items-start justify-start gap-8">
						<div className="relative flex flex-col gap-2 basis-1/6">
							<div className="w-[130px] md:w-[12vw] h-[130px] md:h-[12vw]">
								<ProfilePicture
									user={user}
									onClick={() =>
										open(user.profilePicture, true, true)
									}
								/>
							</div>
							{poaps.length > 0 ? (
								<div
									className="border-2 rounded-2xl p-1 w-[130px] md:w-[12vw] overflow-auto scrollbar-hide cursor-pointer hover:shadow-lg transition-all duration-200 ease-in-out"
									onClick={showPoaps}
								>
									<div className="flex h-max w-max gap-1 items-center mx-auto">
										{poaps &&
											poaps.map((poap, i) => {
												return (
													<Image
														key={"poap-" + i}
														src={
															poap.event.image_url
														}
														className="rounded-full"
														width={30}
														height={30}
														alt=""
													/>
												);
											})}
									</div>
								</div>
							) : null}
						</div>
						<div className="flex flex-col gap-4 items-center md:items-start w-full">
							<div className="flex flex-wrap items-start justify-center md:justify-between w-full gap-4">
								<div className="flex flex-wrap items-center justify-center gap-6">
									<Username
										size="lg"
										center={true}
										user={user}
									/>
									{data?.user?._id != user?._id && (
										<>
											{isFollowing ? (
												<Button
													onClick={unfollow}
													text="Following"
													size="md"
													colour="black"
													filled={false}
												/>
											) : (
												<Button
													onClick={follow}
													text="Follow"
													size="md"
												/>
											)}
										</>
									)}
								</div>
								<div className="flex flex-wrap gap-4 items-center justify-center md:justify-between text-sm">
									<FollowsLink
										link={`/${user?.username}/follows`}
										query={{ choice: "following" }}
										number={user.followers}
										text="Followers"
									/>
									<FollowsLink
										link={`/${user?.username}/follows`}
										query={{ choice: "follows" }}
										number={user.following}
										text="Following"
									/>
									<div className="flex items-center gap-x-2 text-md">
										<Image
											src={"/hand-clap.svg"}
											objectFit="contain"
											alt="Appreciate"
											width={20}
											height={20}
										/>
										<div>{totalLikes}</div>
									</div>
								</div>
							</div>
							<p className="flex break-words text-sm font-thin text-gray-500 w-full md:w-3/4 md:text-left text-center whitespace-pre-wrap">
								{user.bio ? user.bio : ""}
							</p>
							<div className="flex flex-row break-all">
								{user.website && (
									<a
										className="flex items-center gap-x-2 text-primary hover:opacity-75 w-full"
										target="_blank"
										rel="noreferrer"
										href={user.website}
									>
										<Image
											src={linkImg}
											width={15}
											height={15}
											alt=""
										/>
										<p className="line-clamp-1 w-1/2">
											{user.website
												.toString()
												.replace(/^https?:\/\//, "")}
										</p>
									</a>
								)}
							</div>
						</div>
					</div>
					{/* <div className="flex justify-between text-primary flex-wrap">
						{tabs &&
							Object.values(tabs).map((tab, index) => {
								return (
									<div
										key={index}
										onClick={tab.click}
										className="flex items-center"
									>
										<button
											className={
												tab.disabled
													? styles.tabDisabled
													: tab.active
													? style.tabActive
													: style.tab
											}
											disabled={tab.disabled}
										>
											{tab.label}
										</button>
										<Icon src={tab.img.src} />
									</div>
								);
							})}
					</div> */}
					<div className="relative min-h-full">
						{nftGrid && (
							<NftGrid
								nfts={getNftsInTab(nftGrid)}
								user={user}
								currentUser={data?.user?._id}
								open={open}
								like={like}
								mutate={mutate}
								showModal={showModal}
								search={search}
								setNftGrid={setNftGrid}
								setSelected={setSelectedNFTCards}
								editContainer={editContainer}
								newContainer={newContainer}
								updateSelected={updateSelected}
								gridCols={18}
							/>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}

export async function getServerSideProps(context) {
	console.time('load user');
	await nc()
		.use(database, ...auths)
		.run(context.req, context.res);

	if (!context.params.username || context.params.username.length === 0 || !context.params.username.startsWith('@')) {
		return {
			redirect: {
				destination: "/404",
				permanent: false,
			},
		};
	}

	const username = context.params.username.substring(1);
	const userCursor = await findUserByUsernameAgg(
		context.req.db,
		username,
		context.req.user ? context.req.user._id : null
	);
	const userarr = await userCursor.toArray();
	const user = userarr[0];
	if (!user) {
		return {
			redirect: {
				destination: "/404",
				permanent: false,
			},
		};
	}

	user._id = String(user._id);

	let nftArr = user.selected.map((o) => o?._id);

	const nftsCursor = await findNfts(
		context.req.db,
		nftArr,
		context.req.user ? context.req.user._id : null
	);
	const nftData = await nftsCursor.toArray();

	user.selected.map((el) => {
		const index = nftData.findIndex((o) => o._id == el._id);
		if (!el._id?.startsWith("container")) {
			el["data"] = nftData[index];
		}
	});

	// Analytics
	await incrementUserViewCount(context.req.db, user._id);
	console.timeEnd('load user');

	return { props: { user } };
}
