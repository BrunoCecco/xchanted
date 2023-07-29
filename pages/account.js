import { useCurrentUser } from "../lib/user";
import { fetcher } from "../lib/fetch";
import { useRouter } from "next/router";
import { useEffect, useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import NFTIcon from "../public/nfticon.svg";
import Image from "next/image";
import Input from "../components/elements/Input";
import Textarea from "../components/elements/Textarea";
import MenuCard from "../components/settings/MenuCard";
import { IoIosAdd } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { CameraIcon } from "@heroicons/react/outline";
import {
	SortableContainer,
	SortableElement,
	arrayMove,
} from "react-sortable-hoc";
import TagsModal from "../components/modals/TagsModal";
import WalletSelect from "../components/settings/WalletSelect";
import QRCode from "../components/settings/QRCode";
import CollectionModal from "../components/modals/CollectionModal";
import NftImage from "../components/nft/NftImage";
import Button from "../components/elements/Button";
import Icon from "../components/elements/Icon";
import Dropdown from "../components/elements/Dropdown";
import ClipLoader from "react-spinners/ClipLoader";
import Permissions from "../components/settings/Permissions";
import AssetBrowseModal from "../components/modals/AssetBrowseModal";
import ModalService from "../components/modals/services/ModalService";

const style = {
	inactive: `text-gray-500 hover:text-gray-700 cursor-pointer`,
	active: `text-gray-800 font-black`,
};

const Profile = ({ user, mutate }) => {
	const usernameRef = useRef();
	const nameRef = useRef();
	const nameSelectRef = useRef();
	const emailRef = useRef();
	const bioRef = useRef();
	const [bioInp, setBioInp] = useState("");
	const websiteRef = useRef();
	const [ensNames, setEnsNames] = useState([]);
	const [solNames, setSolNames] = useState([]);
	const [selectedUsername, setSelectedUsername] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [selectedNFTCard, setSelectedNFTCard] = useState(null);
	const [selectedBannerNFT, setSelectedBannerNFT] = useState(null);
	const [selectedNFTCards, setSelectedNFTCards] = useState([]); //for banner
	const [selectingBanner, setSelectingBanner] = useState(false); // for modal when selecting banner
	const [userNfts, setUserNfts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [namesLoading, setNamesLoading] = useState(false);

	const modalProps = {
		user: user,
		heading: "",
		modalSelectOne: true,
		setSelectedNFTCards: setSelectedNFTCards,
		selectedNFTCards: selectedNFTCards,
		setSelectedNFTCard: setSelectedNFTCard,
		selectedNFTCard: selectedNFTCard,
		setSelectedBannerNFT: setSelectedBannerNFT,
		selectingBanner: false,
	};

	const onSubmit = useCallback(
		async (e, field, usernameNft) => {
			if (nameRef.current.value.indexOf(".") !== -1) {
				toast("Names cannot contain dots");
				nameRef.current.value = nameRef.current.value.replaceAll(
					".",
					""
				);
			}
			try {
				const formData = new FormData();
				if (field == "name" || !field)
					formData.append("name", nameRef.current.value);
				if (field == "username" || !field)
					formData.append("username", usernameRef.current.value);
				if (field == "username" && usernameNft) {
					console.log("SELCTED USERNAME");
					formData.append("usernameNFT", JSON.stringify(usernameNft));
				}
				if (field == "email" || !field)
					formData.append("email", emailRef.current.value);
				if (field == "bio" || !field)
					formData.append("bio", bioRef.current.value);
				if (field == "website" || !field)
					formData.append("website", websiteRef.current.value);

				const response = await fetcher("/api/user", {
					method: "PATCH",
					body: formData,
				});
				if (response.error) {
					toast.error(response.error);
				} else {
					mutate({ user: response.user }, false);
					toast.success("Your profile has been updated");
				}
			} catch (e) {
				toast.error(e.message);
				console.error(e.message);
				setFields();
			}
		},
		[mutate, selectedUsername, setFields]
	);

	const chooseProfilePic = () => {
		ModalService.open(AssetBrowseModal, {
			...modalProps,
			heading: "Choose your new profile picture NFT!",
		});
	};

	const chooseNFTBanner = () => {
		setSelectingBanner(true);
		ModalService.open(AssetBrowseModal, {
			...modalProps,
			selectedNFTCards: [],
			selectingBanner: true,
			heading: "Choose your banner NFT!",
		});
	};

	const setNFTBanner = useCallback(
		async (nftBanner) => {
			try {
				const formData = new FormData();
				formData.append("bannerNFT", JSON.stringify(nftBanner));
				const res = await fetcher("/api/user", {
					method: "PATCH",
					body: formData,
				});
				toast.success("Banner updated");
				mutate({ user: res.user }, false);
			} catch (err) {
				toast.error(err.message);
				console.error(err.message);
			}
		},
		[mutate]
	);

	const setBg = useCallback(
		async (e) => {
			try {
				setLoading(true);
				const file = e.target.files[0];
				if (file?.type && !file?.type.startsWith("image/")) {
					console.log("File is not an image!", file?.type);
					toast.error("File is not an image!");
					setLoading(false);
					return;
				}

				const filename = encodeURIComponent(file?.name);
				const { user, post } = await fetcher(
					`/api/user/banner?file=${filename}`
				);
				const upload = await fetch(post, {
					method: "PUT",
					body: file,
					headers: {
						"Content-Type": file.type,
					},
				});
				if (upload.error || upload.status !== 200) {
					toast.error("Error uploading file");
					setLoading(false);
				} else {
					setSelectedFile(upload.url);
					// mutate({ user: user }, false); -- makes it glitchy
					toast.success("Banner updated");
					setLoading(false);
				}
			} catch (e) {
				console.log("ERROR", e);
				toast.error("Error uploading banner");
			}
		},
		[mutate]
	);

	const removeBanner = useCallback(async () => {
		try {
			setSelectedBannerNFT(null);
			setSelectedFile(null);
			const res1 = await fetcher("/api/user/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					field: "banner",
				}),
			});
			const res2 = await fetcher("/api/user/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					field: "bannerNFT",
				}),
			});
			mutate({ user: res2.user }, false);
			toast.success("Banner removed");
			setLoading(false);
		} catch (err) {
			toast.error(err.message);
			console.error(err.message);
		}
	}, [mutate]);

	const setFields = useCallback(() => {
		usernameRef.current.value = user.usernameNFT?.name
			? user.usernameNFT.name
			: user.username
			? user.username
			: "";
		nameRef.current.value = user.name ? user.name : "";
		if (nameSelectRef.current) {
			nameSelectRef.current.value = user.usernameNFT
				? user.usernameNFT.name
				: "";
		}
		bioRef.current.value = user.bio = user.bio ? user.bio : "";
		emailRef.current.value = user.email = user.email ? user.email : "";
		websiteRef.current.value = user.website ? user.website : "";
		setSelectedNFTCard(user.profilePicture);
		setSelectedFile(user.banner);
		setSelectedBannerNFT(user.bannerNFT);
	}, [user]);

	useEffect(() => {
		setFields();
	}, [user]);

	useEffect(() => {
		const getEnsNames = async () => {
			try {
				const nfts = await fetcher("/api/collection", {
					method: "get",
				});
				let names = [];
				const n = JSON.parse(nfts);
				setUserNfts(n);
				n.map((nft) => {
					if (
						nft._id.includes(
							"0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"
						)
					) {
						if (nft?.metadata?.name) {
							names.push(nft.metadata.name);
						}
					}
				});
				setEnsNames(names);
			} catch (err) {
				console.error(err.message);
			}
		};

		const fetchSolNames = async () => {
			setNamesLoading(true);
			const res = await fetcher("/api/wallet/getSol", {
				method: "GET",
			});
			setNamesLoading(false);
			setSolNames(res.names);
		};

		fetchSolNames();
		getEnsNames();
	}, [user]);

	useEffect(() => {
		if (bioInp.length >= bioRef.current.maxLength) {
			toast("Bio cannot exceed 160 characters");
		}
	}, [bioInp]);

	const setPP = useCallback(
		async (nftPP) => {
			try {
				const formData = new FormData();
				formData.append("profilePicture", JSON.stringify(nftPP));
				const res = await fetcher("/api/user", {
					method: "PATCH",
					body: formData,
				});
				mutate({ user: res.user }, false);
				toast.success("Profile picture updated");
			} catch (err) {
				toast.error(err.message);
				console.error(err.message);
			}
		},
		[mutate]
	);

	const removePP = useCallback(async () => {
		setSelectedNFTCard(null);
		try {
			const res = await fetcher("/api/user/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					field: "profilePicture",
				}),
			});
			mutate({ user: res.user }, false);
			toast.success("Profile picture removed!");
			chooseProfilePic();
		} catch (err) {
			toast.error(err.message);
			console.error(err.message);
		}
	}, [mutate]);

	const editTags = () => {
		setSelectedNFTCards(user?.tagged);
		ModalService.open(TagsModal, {
			...modalProps,
			editing: true,
			modalSelectOne: false,
			selectedNFTCards: user?.tagged,
		});
	};

	// for updating user profile picture from modal
	useEffect(() => {
		if (
			(!user.profilePicture || user.profilePicture == {}) &&
			selectedNFTCard
		) {
			setPP(selectedNFTCard);
		}
	}, [selectedNFTCard, user.profilePicture]);

	// for updating user banner from modal
	useEffect(() => {
		if (selectedBannerNFT && selectingBanner) {
			setNFTBanner(selectedBannerNFT);
			setSelectingBanner(false);
		}
	}, [selectedBannerNFT, selectingBanner]);

	//Collections
	const [selCols, setSelCols] = useState([]);
	const [userCollections, setUserCollections] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const uniqueItems = [...new Set(user?.nfts)];
			const collectionIds = uniqueItems.map((item) =>
				item ? item.match(/.+?(?=-)/g)[0] : null
			);
			try {
				const res = await fetcher("/api/collection/getByIds", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						collectionIds: collectionIds,
					}),
				});
				const cols = JSON.parse(res);
				setUserCollections(cols);
			} catch (error) {
				console.log("error", error);
			}
		};

		fetchData();
	}, []);

	const saveSelectedCollections = async (selectedCol) => {
		let newSelected = selectedCol;
		try {
			const response = await fetcher("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					selected: newSelected,
					type: "collection",
				}),
			});
			mutate({ user: response.user }, false);
			toast.success("Selected Collections saved");
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
		}
	};

	useEffect(() => {
		const arr = new Array(3);
		arr.fill({});
		if (user.selectedCollections) {
			user.selectedCollections.map((col, i) => {
				arr[i] = col;
			});
		}
		setSelCols(arr);
	}, [user.selectedCollections]);

	const openCollectionsModal = (num) => {
		ModalService.open(CollectionModal, {
			saveSelectedCollections: saveSelectedCollections,
			sortNum: num,
			userCollections: userCollections,
		});
	};

	const onSortEnd = ({ oldIndex, newIndex }) => {
		const arr = arrayMove(selCols, oldIndex, newIndex);
		setSelCols(arr);
		saveSelectedCollections(arr);
	};

	const SortableItem = SortableElement(({ src, sortIndex }) => (
		<div
			className="bg-primary h-[25px] w-[25px] mx-1 rounded-full object-contain flex text-2xl text-center text-white items-center hover:scale-125 cursor-pointer"
			onClick={() => {
				openCollectionsModal(sortIndex);
			}}
		>
			{src ? (
				<img
					src={src}
					className="h-full w-full rounded-full"
					alt="collection"
				/>
			) : (
				<IoIosAdd />
			)}
		</div>
	));

	const SortableList = SortableContainer(({}) => {
		return (
			<ul className="w-full h-full flex-wrap flex gap-2 items-center justify-center text-center">
				{selCols.map((item, index) => (
					<SortableItem
						key={`item-${index}`}
						index={index}
						sortIndex={index}
						src={item.image_url}
						//item={item.data}
						//disabled={!editing}
					/>
				))}
			</ul>
		);
	});

	const verify = async () => {
		try {
			const res2 = await fetcher("/api/user/email/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: user.email,
				}),
			});
			console.log(res2);
		} catch (e) {
			console.log(e);
		}
	};

	const selectNftName = (e) => {
		if (e.value == "None") {
			setSelectedUsername(null);
			onSubmit(e, "username", null);
		} else {
			let ensNft = userNfts.find((nft) => nft.name == e.value);
			if (ensNft) {
				setSelectedUsername(ensNft);
				usernameRef.current.value = ensNft.name;
				onSubmit(e, "username", ensNft);
			} else {
				setSelectedUsername({ _id: e.value, name: e.value });
				usernameRef.current.value = e.value;
				onSubmit(e, "username", { _id: e.value, name: e.value });
			}
		}
	};

	return (
		<>
			<div className="flex flex-col w-full items-center">
				<div className="relative md:w-full md:h-[20vw] h-[30vw] w-[90vw]">
					{selectedFile ? (
						<>
							<div
								className="rounded-2xl h-full w-full object-contain mx-auto overflow-hidden bg-cover bg-center opacity-50"
								style={{
									backgroundImage: `url(${selectedFile})`,
								}}
							></div>
							<button className="absolute top-3 right-3 text-primary">
								<Icon icon={<FiEdit />} onClick={editTags} />
							</button>
						</>
					) : selectedBannerNFT ? (
						<NftImage
							metadata={selectedBannerNFT.data?.metadata}
							classname={
								"relative rounded-2xl h-full w-full mx-auto object-contain overflow-hidden bg-cover bg-center text-center flex justify-center items-center opacity-50"
							}
						/>
					) : (
						<div className="mx-auto flex justify-center items-center h-[15vw] w-full">
							<div className="grid gap-6 grid-cols-2 my-4">
								{loading ? (
									<ClipLoader
										loading={loading}
										size={20}
										color={"#000"}
									/>
								) : (
									<>
										<input
											className="hidden"
											type="file"
											onChange={setBg}
											id="file-upload"
										/>
										<label htmlFor="file-upload">
											<CameraIcon className="h-8 w-8 text-primary cursor-pointer" />
										</label>
										<Image
											src={NFTIcon.src}
											onClick={chooseNFTBanner}
											alt=""
											width={15}
											height={15}
											className="text-primary hover:cursor-pointer"
										/>
									</>
								)}
							</div>
						</div>
					)}
					{(selectedBannerNFT || selectedFile) && (
						<button
							className="absolute w-[90%] h-[70%] top-0 left-0 bottom-0 right-0 m-auto font-bold text-primary hover:opacity-75"
							onClick={removeBanner}
						>
							CHANGE
						</button>
					)}
				</div>
				<div className="text-center">
					{selectedBannerNFT || selectedFile ? null : (
						<h3 className="text-lg leading-6 font-medium text-gray-900">
							Upload a banner
						</h3>
					)}
				</div>
				<div className="flex w-full my-6 md:flex-nowrap flex-wrap gap-2 items-center justify-between">
					<div className="flex flex-col gap-2 md:basis-2/3 w-full">
						<div>
							<Input
								name="name"
								type="text"
								ref={nameRef}
								placeholder="Name"
								label="Name"
								onBlur={(e) => onSubmit(e, "name")}
							/>
						</div>
						<div className="w-full relative">
							<Input
								name="username"
								type="text"
								ref={usernameRef}
								placeholder="Username"
								label="Username"
								onBlur={(e) => onSubmit(e, "username")}
							/>
							<div className="absolute right-0 top-0 flex items-center">
								<Dropdown
									ref={nameSelectRef}
									options={
										namesLoading
											? ["None"].concat(
													ensNames
														.concat(solNames)
														.concat("Loading...")
											  )
											: ["None"].concat(
													ensNames.concat(solNames)
											  )
									}
									value={"ENS/SOL Names"}
									onChange={selectNftName}
								/>
							</div>
						</div>
					</div>
					<div className="flex items-center justify-center md:justify-end md:basis-1/3 h-full w-full">
						{user.profilePicture || selectedNFTCard ? (
							<div
								className="relative md:w-[12vw] md:h-[12vw] w-[100px] h-[100px]"
								onClick={removePP}
							>
								<NftImage
									metadata={
										user.profilePicture?.data?.metadata ||
										selectedNFTCard?.data?.metadata
									}
									classname={
										"opacity-50 rounded-2xl w-full h-full overflow-hidden bg-center bg-cover"
									}
								/>
								<div className="absolute flex items-center justify-center top-0 bottom-0 left-0 right-0 text-primary font-bold cursor-pointer hover:opacity-75">
									CHANGE
								</div>
							</div>
						) : (
							<div
								className="border-2 md:w-[10vw] md:h-[10vw] w-[100px] h-[100px] rounded-2xl text-center flex justify-center items-center cursor-pointer"
								onClick={chooseProfilePic}
							>
								<img
									src={NFTIcon.src}
									aria-hidden="true"
									alt=""
									className="h-8 w-8 text-primary hover:cursor-pointer"
								/>
							</div>
						)}
					</div>
				</div>
				<div className="mx-auto w-full flex flex-col overflow-hidden">
					<div className="relative flex flex-wrap w-full md:mx-auto object-contain justify-between">
						<form onSubmit={onSubmit} className="w-full">
							<div className="flex flex-col mb-2 justify-between">
								<div className="w-full flex md:flex-nowrap flex-wrap gap-2">
									<div className="md:basis-2/3 w-full h-full relative">
										{user.emailVerified == false ? (
											<span
												className="text-green-500 text-xs cursor-pointer hover:opacity-75 absolute left-12"
												onClick={verify}
											>
												(Verify)
											</span>
										) : null}
										<Input
											name="email"
											type="text"
											ref={emailRef}
											placeholder="Email"
											label="Email"
											onBlur={(e) => onSubmit(e, "email")}
										/>
									</div>
									<div className="md:basis-1/3 h-full w-full">
										<label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 justify-center">
											Favourite collections
										</label>
										<div className="appearance-none block w-full bg-white text-gray-700 border border-gray-300 rounded-xl h-12 items-center leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
											<SortableList
												axis="xy"
												distance={1}
												onSortEnd={onSortEnd}
											/>
										</div>
									</div>
								</div>
							</div>
							<div className="flex flex-wrap mb-2">
								<div className="w-full">
									<Textarea
										rows="4"
										label="Bio"
										maxLength="160"
										placeholder="About you ;)"
										ref={bioRef}
										onChange={(e) =>
											setBioInp(e.target.value)
										}
										onBlur={(e) => onSubmit(e, "bio")}
									/>
								</div>
							</div>
							<div className="flex flex-wrap">
								<div className="w-full">
									<Input
										name="website"
										type="text"
										ref={websiteRef}
										placeholder="Website"
										label="Website url"
										onBlur={(e) => onSubmit(e, "website")}
									/>
								</div>
							</div>
						</form>
					</div>
					<div className="flex flex-wrap my-6 items-center justify-center">
						<Button onClick={onSubmit} text="Save" />
					</div>
				</div>
			</div>
		</>
	);
};

export default function Account() {
	const { data, error, mutate } = useCurrentUser();
	const router = useRouter();
	const [tabs, setTabs] = useState([]);
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		setActiveTab(
			window.localStorage.getItem("activeTab")
				? window.localStorage.getItem("activeTab")
				: 0
		);
	});

	useEffect(() => {
		data &&
			data.user &&
			setTabs([
				{
					id: 0,
					name: "Profile",
					isActive: activeTab == 0,
					component: <Profile user={data.user} mutate={mutate} />,
				},
				{
					id: 1,
					name: "Wallet",
					isActive: activeTab == 1,
					component: (
						<WalletSelect
							data={data}
							newUser={false}
							mutate={mutate}
						/>
					),
				},
				{
					id: 2,
					name: "QR Code",
					isActive: activeTab == 2,
					disabled: true,
					component: <QRCode data={data} />,
				},
				{
					id: 3,
					name: "Permissions",
					isActive: activeTab == 3,
					disabled: true,
					component: <Permissions user={data.user} />,
				},
			]);
	}, [data, mutate, activeTab]);

	useEffect(() => {
		if (!data && !error) return; // useCurrentUser might still be loading
		if (!data.user) {
			router.replace("/sign-in");
		}
	}, [router, data, error]);
	if (!data?.user) return null;

	const clickTab = (index) => {
		// save index of tab to local storage
		if (typeof window != undefined) {
			window.localStorage.setItem("activeTab", index);
		}
		setActiveTab(index);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-[30%_70%] justify-center py-20 gap-12 md:gap-0">
			<div className="min-w-[200px] w-auto mx-8">
				{/* {isUpdatingWallets && (
					<Updates
						socketId={data.user._id}
						setIsUpdatingWallets={setIsUpdatingWallets}
					/>
				)} */}
				<MenuCard
					user={data.user}
					tabs={tabs}
					onClick={(index) => clickTab(index)}
				/>
			</div>
			<div className="md:min-w-[600px] w-auto md:w-[60vw] mx-8">
				{tabs[activeTab] && tabs[activeTab].component}
			</div>
		</div>
	);
}

const useToggleWallet = (initialState = false) => {
	// Initialize the state
	const [selected, setSelected] = useState(initialState);

	// Define and memorize toggler function in case we pass down the component,
	// This function change the boolean value to its opposite value
	const toggle = useCallback(() => setSelected((selected) => !selected), []);

	return [selected, toggle];
};

const useToggleQRCode = (initialState = false) => {
	// Initialize the state
	const [selected, setSelected] = useState(initialState);

	// Define and memorize toggler function in case we pass down the component,
	// This function change the boolean value to its opposite value
	const toggle = useCallback(() => setSelected((selected) => !selected), []);

	return [selected, toggle];
};
