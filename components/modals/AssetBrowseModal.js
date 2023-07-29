import Modal from "./Modal";
import ModalContent from "./ModalContent";
import ModalHeader from "./ModalHeader";
import ModalService from "./services/ModalService";
import TagsModal from "./TagsModal";
import Searchbar from "../elements/Searchbar";
import { BsGrid3X3Gap } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import Icon from "../elements/Icon";
import Button from "../elements/Button";
import ClipLoader from "react-spinners/ClipLoader";
import NFTCard from "../nft/NFTCard";
import { IoIosClose } from "react-icons/io";
import CollectionTag from "../elements/CollectionTag";
import { useState, useEffect, useCallback } from "react";
import { fetcher } from "../../lib/fetch";
import toast from "react-hot-toast";
import {
	SortableContainer,
	SortableElement,
	arrayMove,
} from "react-sortable-hoc";

export default function AssetBrowseModal(props) {
	const setSelectedNFTCards = props.setSelectedNFTCards;
	const selectedNFTCards = props.selectedNFTCards;
	const setSelectedNFTCard = props.setSelectedNFTCard;
	const setSelectedBannerNFT = props.setSelectedBannerNFT;

	const [collectionsOrder, setCollectionsOrder] = useState(
		props.user?.collectionsOrder || []
	);
	const [sortingCollections, setSortingCollections] = useState(false);
	const [collectionNFTs, setCollectionNFTs] = useState([]);
	const [allNfts, setAllNfts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [allCollections, setAllCollections] = useState([]);
	const [allHiddenCollections, setAllHiddenCollections] = useState(
		props.user?.hiddenCollections || []
	);
	const [collections, setCollections] = useState([]);
	const [selectedCollection, setSelectedCollection] = useState(null);
	const [selectedCollections, setSelectedCollections] = useState([]);
	const [hiddenCollections, setHiddenCollections] = useState(
		props.user?.hiddenCollections || []
	);
	const [allSelected, setAllSelected] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const nfts = await fetcher("/api/collection", {
					method: "get",
				});
				const n = JSON.parse(nfts);
				setAllNfts(n);
				setCollectionNFTs(
					n.filter((el) => {
						let hidden = hiddenCollections.map((col) => col?._id);
						let nftCollection = el._id.match(/.+?(?=-)/g)[0];
						return !hiddenCollections
							.map((col) => col?._id)
							.includes(nftCollection);
					})
				);
				const uniqueItems = [...new Set(n.map((el) => el._id))];
				const collectionIds = uniqueItems.map(
					(item) => item.match(/.+?(?=-)/g)[0]
				);
				const res = await fetcher("/api/collection/getByIds", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						collectionIds: collectionIds,
					}),
				});
				const cols = JSON.parse(res);
				setAllCollections(cols);
				setCollections(cols);
				if (collectionsOrder?.length == 0 || !collectionsOrder) {
					setCollectionsOrder(cols.map((c) => c._id));
				} else {
					cols.map((col) => {
						if (collectionsOrder.indexOf(col._id) < 0) {
							setCollectionsOrder((order) => [...order, col._id]);
						}
					});
				}
				setLoading(false);
			} catch (error) {
				console.log("error", error);
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (allNfts) {
			if (selectedCollection == null) {
				setCollectionNFTs(
					allNfts.filter((el) => {
						let hidden =
							hiddenCollections &&
							hiddenCollections.map((col) => col?._id);
						let nftCollection = el._id.match(/.+?(?=-)/g)[0];
						return !hiddenCollections
							.map((col) => col?._id)
							.includes(nftCollection);
					})
				);
			} else {
				setCollectionNFTs(
					allNfts.filter((el) => el._id.includes(selectedCollection))
				);
			}
		}
	}, [allNfts, hiddenCollections, selectedCollection]);

	const handleSave = async (e) => {
		e.preventDefault();
		if (props.selectingTags) {
			console.log(selectedNFTCards);
			setTags(selectedNFTCards);
			ModalService.open(TagsModal, {
				...props,
				editing: true,
				modalSelectOne: false,
				selectedNFTCards: props.user?.tagged,
			});
			return;
		}
		setLoading(true);
		await props.onSave();
		setLoading(false);
	};

	const setTags = async (taggedNFTs) => {
		try {
			const formData = new FormData();
			formData.append("tagged", JSON.stringify(taggedNFTs));
			const res = await fetcher("/api/user", {
				method: "PATCH",
				body: formData,
			});
			props.setUser(res.user);
			toast.success("Tags updated");
		} catch (err) {
			toast.error(err.message);
			console.error(err.message);
		}
	};

	function search(searchVal) {
		let searched = allNfts.filter((nft) => {
			const name = nft.name?.toLowerCase();
			const name2 =
				nft.metadata?.name == null
					? ""
					: nft.metadata.name.toLowerCase();
			if (
				searchVal.trim() == "" ||
				name?.indexOf(searchVal.toLowerCase()) != -1 ||
				name2?.indexOf(searchVal.toLowerCase()) != -1
			) {
				return nft;
			} else {
				return;
			}
		});
		setCollectionNFTs(
			searched.filter((el) => {
				let hidden =
					hiddenCollections &&
					hiddenCollections.map((col) => col?._id);
				let nftCollection = el._id.match(/.+?(?=-)/g)[0];
				return (
					hiddenCollections &&
					!hiddenCollections
						.map((col) => col?._id)
						.includes(nftCollection)
				);
			})
		);
	}

	function searchCollections(searchVal) {
		let searched = allCollections.filter((collection) => {
			const name = collection.name.toLowerCase();
			if (
				searchVal.trim() == "" ||
				name.indexOf(searchVal.toLowerCase()) != -1
			) {
				return collection;
			} else {
				return;
			}
		});
		setCollections(searched);
		setHiddenCollections(
			allHiddenCollections.filter((col) =>
				searched.map((el) => el._id).includes(col?._id)
			)
		);
	}

	const selectAll = (col) => {
		if (col == null) {
			setSelectedNFTCards(allNfts);
			setSelectedCollections(collections.map((el) => el._id));
		} else {
			setSelectedCollections([...selectedCollections, col]);
			let newSelected = [...selectedNFTCards];
			allNfts
				.filter((el) => el._id.includes(col))
				.forEach((nft) => {
					if (
						newSelected.findIndex((el) => el._id === nft._id) === -1
					) {
						newSelected.push(nft);
					}
				});
			setSelectedNFTCards(newSelected);
			console.log(newSelected);
		}
		setAllSelected(true);
	};

	const deselectAll = (col) => {
		if (col == null) {
			setSelectedCollections([]);
			setSelectedNFTCards([]);
		} else {
			setSelectedCollections(
				selectedCollections.filter((el) => el !== col)
			);
			let newSelected = [...selectedNFTCards];
			newSelected = newSelected.filter((el) => !el._id.includes(col));
			setSelectedNFTCards(newSelected);
		}
		setAllSelected(false);
	};

	const clickCollection = (colId) => {
		if (selectedCollections.includes(colId)) {
			deselectAll(colId);
		} else {
			selectAll(colId);
			setSelectedCollection(colId);
		}
	};

	const hideCollection = async (col) => {
		let newHidden = [];
		if (
			hiddenCollections &&
			!hiddenCollections.map((el) => el._id).includes(col?._id)
		) {
			newHidden = [...hiddenCollections, col];
		} else if (hiddenCollections == null) {
			newHidden = [col];
		} else {
			newHidden = [...hiddenCollections];
		}
		try {
			const formData = new FormData();
			formData.append("hiddenCollections", JSON.stringify(newHidden));
			const res = await fetcher("/api/user", {
				method: "PATCH",
				body: formData,
			});
			props.setUser(res.user);
			console.log(res.user.hiddenCollections);
			setAllHiddenCollections(res.user.hiddenCollections);
			setHiddenCollections(res.user.hiddenCollections);
			deselectAll(col?._id);
			toast.success("Collection hidden");
		} catch (err) {
			toast.error(err.message);
			console.error(err.message);
		}
	};

	const showCollection = async (col) => {
		let newHidden = hiddenCollections && [
			...hiddenCollections.filter((el) => el?._id !== col?._id),
		];
		try {
			const formData = new FormData();
			formData.append("hiddenCollections", JSON.stringify(newHidden));
			const res = await fetcher("/api/user", {
				method: "PATCH",
				body: formData,
			});
			props.setUser(res.user);
			setAllHiddenCollections(res.user.hiddenCollections);
			setHiddenCollections(res.user.hiddenCollections);
			toast.success("Collection discovered");
		} catch (err) {
			toast.error(err.message);
			console.error(err.message);
		}
	};

	const onCollectionSortEnd = ({ oldIndex, newIndex }) => {
		setCollectionsOrder(arrayMove(collectionsOrder, oldIndex, newIndex));
	};

	const SortableCollectionItem = SortableElement(({ item, sortIndex }) => (
		<CollectionTag
			key={sortIndex}
			col={item}
			clickEye={hideCollection}
			select={setSelectedCollection}
			selected={selectedCollections}
			clickCollection={clickCollection}
			sorting={sortingCollections}
		/>
	));

	const SortableCollectionList = SortableContainer(({ items }) => {
		return (
			<ul>
				{items.map((cid, index) => {
					if (
						!hiddenCollections ||
						(hiddenCollections &&
							!hiddenCollections
								.map((el) => el?._id)
								.includes(cid))
					) {
						let col = collections.find((c) => c._id == cid);
						return (
							col && (
								<SortableCollectionItem
									item={col}
									key={`item-${index}`}
									index={index}
									sortIndex={index}
									disabled={!sortingCollections}
								/>
							)
						);
					}
				})}
				{items.length == 0 && (
					<div className="w-full text-center">
						<ClipLoader
							loading={items.length == 0}
							size={20}
							color={"#000"}
						/>
					</div>
				)}
			</ul>
		);
	});

	const sortCollections = async () => {
		if (!sortingCollections) {
			setSortingCollections(true);
		} else {
			setSortingCollections(false);
			try {
				const formData = new FormData();
				formData.append(
					"collectionsOrder",
					JSON.stringify(collectionsOrder)
				);
				const res = await fetcher("/api/user", {
					method: "PATCH",
					body: formData,
				});
				props.setUser(res.user);
				toast.success("Collections saved");
			} catch (err) {
				console.log(err);
				toast.error(err.message);
			}
		}
	};

	return (
		<Modal>
			<ModalContent>
				<div className="overflow-hidden h-full top-0 relative flex gap-10 items-center justify-center w-full">
					<div className="flex flex-col h-full items-center justify-start w-1/4 bg-gray-300 rounded-l-2xl">
						<div className="z-50 p-6">
							<Searchbar
								placeholder="Search Collections"
								onChange={(e) =>
									searchCollections(e.target.value)
								}
								type="text"
							/>
						</div>
						<div className="w-full flex justify-end px-6">
							<Icon
								icon={
									sortingCollections ? (
										<MdCheck />
									) : (
										<FiEdit />
									)
								}
								onClick={sortCollections}
							/>
						</div>
						<div className="w-full h-full overflow-y-auto">
							<div
								className="my-1 relative text-white hover:text-black flex justify-start gap-2 items-center w-full hover:bg-white px-6 cursor-pointer"
								onClick={() => setSelectedCollection(null)}
							>
								<div className="w-10 h-10 flex items-center justify-center">
									<BsGrid3X3Gap className="w-6 h-6 text-gray-500" />
								</div>
								<div className="text-black px text-left font-bold">
									All
								</div>
							</div>
							{collectionsOrder && (
								<SortableCollectionList
									helperClass={"sortable-list"}
									items={collectionsOrder}
									onSortEnd={onCollectionSortEnd}
								/>
							)}
							{hiddenCollections &&
								hiddenCollections.map((col) => {
									return (
										<CollectionTag
											key={col?._id}
											col={col}
											clickEye={showCollection}
											select={setSelectedCollection}
											selected={selectedCollections}
											clickCollection={clickCollection}
											hidden={true}
										/>
									);
								})}
						</div>
					</div>
					<div className="flex flex-col h-full items-center justify-center w-3/4">
						<ModalHeader
							heading={props.heading}
							close={props.close}
						>
							<div className="flex flex-wrap items-center justify-between w-full">
								<Searchbar
									onChange={(e) => search(e.target.value)}
									type="text"
									placeholder="Search NFTs"
								/>
								<div className="flex items-center gap-2">
									{!props.modalSelectOne && (
										<Button
											size="sm"
											onClick={
												allSelected
													? () =>
															deselectAll(
																selectedCollection
															)
													: () =>
															selectAll(
																selectedCollection
															)
											}
											text={
												allSelected
													? "Deselect All"
													: "Select All"
											}
											colour="black"
											filled={false}
										/>
									)}
									{loading ? (
										<ClipLoader
											loading={loading}
											size={20}
											color={"#000"}
										/>
									) : (
										!props.modalSelectOne && (
											<Button
												size="sm"
												onClick={handleSave}
												text="Done"
											/>
										)
									)}
								</div>
							</div>
						</ModalHeader>
						<div className="h-full overflow-y-auto mx-auto w-auto">
							<div
								className="justify-center h-full grid gap-8"
								style={{
									gridAutoRows: "20vw",
									gridTemplateColumns: "repeat(3, 15vw)",
								}}
							>
								{loading ? (
									<ClipLoader
										loading={loading}
										size={20}
										color={"#000"}
									/>
								) : collectionNFTs.length == 0 ? (
									<p className="m-auto col-start-2">
										No NFTs to display!
									</p>
								) : null}
								{collectionNFTs &&
									collectionNFTs.map((item) => (
										<div
											key={item._id}
											id={item._id}
											className="h-full"
										>
											<NFTCard
												item={item}
												closeModal={props.close}
												selectOne={props.modalSelectOne}
												setSelectedNFTCards={
													setSelectedNFTCards
												}
												selectedNFTCards={
													selectedNFTCards
												}
												setSelectedNFTCard={
													props.setSelectedNFTCard
												}
												setSelectedBannerNFT={
													setSelectedBannerNFT
												}
												selectingBanner={
													props.selectingBanner
												}
											/>
										</div>
									))}
							</div>
						</div>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
