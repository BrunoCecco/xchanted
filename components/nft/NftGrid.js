import React, { useEffect, useState, useRef, useCallback } from "react";
import Searchbar from "../elements/Searchbar";
import Icon from "../elements/Icon";
import GridLayout from "react-grid-layout";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { withSize } from "react-sizeme";
import Card from "./card";
import GridContainer from "../elements/GridContainer";
import { BiMessageSquareAdd, BiSelectMultiple } from "react-icons/bi";
import { MdOutlineCancel } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { RiCheckboxMultipleFill } from "react-icons/ri";
import {
	AiOutlinePlusCircle,
	AiOutlineMinusCircle,
	AiFillEyeInvisible,
	AiOutlineMobile,
	AiOutlineLaptop,
} from "react-icons/ai";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import {
	CgMergeHorizontal,
	CgMergeVertical,
	CgUndo,
	CgRedo,
} from "react-icons/cg";
import { ImMoveUp } from "react-icons/im";
import { IoIosClose } from "react-icons/io";
import toast from "react-hot-toast";
import { BsCheckSquare } from "react-icons/bs";
import { useRouter } from "next/router";
import { fetcher } from "../../lib/fetch";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

function NftGrid({
	size,
	nfts,
	user,
	currentUser,
	open,
	like,
	mutate,
	showModal,
	search,
	setNftGrid,
	setSelected,
	editContainer,
	newContainer,
	updateSelected,
	gridCols,
	containerId = null,
	isEditing = false,
}) {
	const [layout, setLayout] = useState([]);
	const [oldLayout, setOldLayout] = useState([]);
	const [dragging, setDragging] = useState(false);
	const [placeHolder, setPlaceHolder] = useState({});
	const [editing, setEditing] = useState(isEditing);
	const [allSelected, setAllSelected] = useState(false);
	const [multiSelecting, setMultiSelecting] = useState(false);
	const [compact, setCompact] = useState(null);
	const [multiSelectedCards, setMultiSelectedCards] = useState([]);
	const [undoStack, setUndoStack] = useState([]);
	const [redoStack, setRedoStack] = useState([]);
	const [rowGap, setRowGap] = useState(0);
	const [columnGap, setColumnGap] = useState(0);
	const [rowHeight, setRowHeight] = useState(0);
	const [gridWidth, setGridWidth] = useState(0);
	const [columns, setColumns] = useState(0);
	const [gridBoxes, setGridBoxes] = useState(0);
	const [editingMobile, setEditingMobile] = useState(false);

	const defaultW = 3;
	const defaultH = 3;

	const [nlayout, setNlayout] = useState(layout);

	const editButton = useRef();

	useEffect(() => {
		let cols = gridCols;
		const l = generateLayout(cols, editingMobile);
		setRowGap(Math.floor(size.width / 85));
		setColumnGap(Math.floor(size.width / 85));
		setRowHeight(Math.floor(size.width / 22));
		setGridWidth(Math.floor(size.width));
		setGridBoxes(getNumGridBoxes(l));
		setLayout(l);

		if (editingMobile || size.width < 600) {
			cols = 4;
			if (size.width > 600) {
				setGridWidth(Math.floor(size.width / 3));
			} else {
				setGridWidth(Math.floor(size.width));
				setRowHeight(Math.floor(size.width / 4));
				setColumnGap(Math.floor(size.width / 25));
				setRowGap(Math.floor(size.width / 25));
			}
		}
		if (containerId != null) {
			setColumnGap(0);
			setRowGap(0);
			setRowHeight(50);
			setGridBoxes(Array.from(Array(gridCols * 6).keys()));
		}
		setColumns(cols);
	}, [size.width, editingMobile]);

	useEffect(() => {
		if (layout.length != nfts.length) {
			let newLayout = generateLayout(columns, editingMobile);
			setLayout(newLayout);
		}
	}, [layout.length, nfts]);

	useEffect(() => {
		window.onkeypress = (e) => {
			if (e.key == "Enter" && layout) {
				editButton?.current?.click();
			}
		};
	}, []);

	const style = {
		tab: "cursor-pointer hover:opacity-75",
		tabActive: "cursor-pointer text-gray-500",
	};

	function getNumGridBoxes(l) {
		let num =
			Math.ceil(
				l?.length > 0
					? (Math.max.apply(
							Math,
							l.map((el) => el.y)
					  ) +
							Math.max.apply(
								Math,
								l.map((el) => el.h)
							)) *
							gridCols
					: gridCols
			) +
			gridCols * 2;

		console.log(num);
		// check if isNan
		if (isNaN(num)) {
			return Array.from(Array(36).keys());
		} else {
			return Array.from(Array(num).keys());
		}
	}

	function generateMobileLayout() {
		let currX = 0;
		return nfts.map((nft, i) => {
			if (
				nft.mobileGridData
				//&&
				//nft.mobileGridData?.x != -1 &&
				//nft.mobileGridData?.y != -1
			) {
				currX = (currX + nft.mobileGridData?.w) % 4;
				return { ...nft.mobileGridData, i: nft._id };
			} else {
				let obj = {
					i: nft._id,
					x: currX,
					y: 0,
					w: 2,
					h: 2,
				};
				currX = (currX + 2) % 4;
				return obj;
			}
		});
	}

	function generateLayout(cols, mobile = false) {
		let currX = 0;
		let l;
		if ((size.width < 600 || mobile) && containerId == null) {
			// mobile
			l = generateMobileLayout();
		} else {
			l = nfts.map((nft) => {
				if (
					nft.gridData &&
					nft.gridData.x != -1 &&
					nft.gridData.y != -1
				) {
					currX = (currX + nft.gridData.w) % cols;
					return { ...nft.gridData, i: nft._id };
				} else {
					let obj = {
						i: nft._id,
						x: currX,
						y: 0,
						w: defaultW,
						h: defaultH,
					};
					currX = (currX + defaultW) % cols;
					return obj;
				}
			});
		}
		return l;
	}

	const isColliding = (rect1, rect2) => {
		if (
			rect1.x < rect2.x + rect2.w &&
			rect1.x + rect1.w > rect2.x &&
			rect1.y < rect2.y + rect2.h &&
			rect1.h + rect1.y > rect2.y
		) {
			return true;
		} else {
			return false;
		}
	};

	const undo = () => {
		if (undoStack.length > 0) {
			setRedoStack([...redoStack, layout]);
			setLayout(undoStack[undoStack.length - 1]);
			setUndoStack(undoStack.slice(0, undoStack.length - 1));
		}
	};

	const redo = () => {
		if (redoStack.length > 0) {
			setUndoStack([...undoStack, layout]);
			setLayout(redoStack[redoStack.length - 1]);
			setRedoStack(redoStack.slice(0, redoStack.length - 1));
		}
	};

	const repositionGridOnDrag = (clayout, e) => {
		let newLayout = [];
		for (let i = 0; i < clayout.length; i++) {
			if (clayout[i].i == e.i) {
				newLayout[i] = placeHolder;
				continue;
			}
			if (!isColliding(oldLayout[i], placeHolder)) {
				newLayout[i] = oldLayout[i];
			} else {
				newLayout[i] = clayout[i];
			}
		}
		setLayout(newLayout);
		saveGrid(newLayout, false);
	};

	const increaseSize = () => {
		let newLayout = [];
		layout.map((nft) => {
			if (multiSelecting) {
				if (multiSelectedCards.includes(nft.i) && nft.w < columns) {
					newLayout.push({ ...nft, w: nft.w + 1, h: nft.h + 1 });
				} else {
					newLayout.push(nft);
				}
			} else if (nft.w < columns) {
				newLayout.push({ ...nft, w: nft.w + 1, h: nft.h + 1 });
			} else {
				newLayout.push(nft);
			}
		});
		setLayout(newLayout);
	};

	const decreaseSize = () => {
		let newLayout = [];
		layout.map((nft) => {
			if (multiSelecting) {
				if (
					multiSelectedCards.includes(nft.i) &&
					nft.w > 1 &&
					nft.h > 1
				) {
					newLayout.push({ ...nft, w: nft.w - 1, h: nft.h - 1 });
				} else if (multiSelectedCards.includes(nft.i) && nft.w > 1) {
					newLayout.push({ ...nft, w: nft.w - 1 });
				} else if (multiSelectedCards.includes(nft.i) && nft.h > 1) {
					newLayout.push({ ...nft, h: nft.h - 1 });
				} else {
					newLayout.push(nft);
				}
			} else if (nft.w > 1 && nft.h > 1) {
				newLayout.push({ ...nft, w: nft.w - 1, h: nft.h - 1 });
			} else if (nft.w > 1) {
				newLayout.push({ ...nft, w: nft.w - 1 });
			} else if (nft.h > 1) {
				newLayout.push({ ...nft, h: nft.h - 1 });
			} else {
				newLayout.push(nft);
			}
		});
		setLayout(newLayout);
	};

	const saveGrid = (newLayout, finalSave) => {
		let newNftGrid = [];
		if ((size.width < 600 || editingMobile) && containerId == null) {
			// save as mobile grid
			nfts.map((nft, i) => {
				newNftGrid.push({
					...nft,
					mobileGridData: {
						w: newLayout[i].w,
						h: newLayout[i].h,
						x: newLayout[i].x,
						y: newLayout[i].y,
					},
				});
			});
		} else {
			// save as normal (desktop) grid
			nfts.map((nft, i) => {
				newNftGrid.push({
					...nft,
					gridData: {
						x: newLayout[i].x,
						y: newLayout[i].y,
						w: newLayout[i].w,
						h: newLayout[i].h,
					},
				});
			});
		}
		save(newNftGrid, finalSave);
	};

	const compactGrid = () => {
		if (compact == "vertical") {
			setCompact(null);
			undo();
		} else {
			undoStack.push(layout);
			setCompact("vertical");
		}
	};

	const updateIfCompacted = (l) => {
		if (compact == "vertical") {
			setLayout(l);
		}
	};

	const edit = () => {
		setEditing(!editing);
	};

	const editMobile = () => {
		setEditingMobile(!editingMobile);
		if (editingMobile) {
			setColumns(gridCols);
			setLayout(generateLayout(gridCols, false));
			setOldLayout(generateLayout(gridCols, false));
		} else {
			setColumns(4);
			setLayout(generateMobileLayout());
			setOldLayout(generateMobileLayout());
		}
	};

	const multiSelect = () => {
		setMultiSelecting(!multiSelecting);
	};

	const selectAll = () => {
		setAllSelected(true);
		setMultiSelectedCards(nfts.map((nft) => nft._id));
	};

	const deselectAll = () => {
		setAllSelected(false);
		setMultiSelectedCards([]);
	};

	const confirmHide = async (item) => {
		if (item.nfts.length > 0) {
			confirmAlert({
				title: "Confirm to submit",
				message: "Are you sure you want to remove this container?",
				buttons: [
					{
						label: "Yes",
						onClick: () => hide(item),
					},
					{
						label: "No",
						onClick: () => console.log("No"),
					},
				],
			});
		} else {
			hide(item);
		}
	};

	const hide = async (item) => {
		let newSelected = [];
		if (item._id != null) {
			newSelected = nfts.filter((nft) => nft._id != item._id);
		} else {
			newSelected = nfts.filter(
				(el) => !multiSelectedCards.includes(el._id)
			);
		}
		let res = await updateSelected(newSelected);
		if (containerId != null) {
			setNftGrid(
				res.user.selected.find((el) => el._id == containerId).nfts
			);
			setSelected(
				res.user.selected.find((el) => el._id == containerId).nfts
			);
		} else {
			setNftGrid(res.user.selected);
			setSelected(res.user.selected);
		}
		setMultiSelecting(false);
		setMultiSelectedCards([]);
		toast.success("Selected items hidden");
	};

	const save = async (newSelected, finalSave) => {
		if (finalSave) {
			setEditing(false);
			setMultiSelecting(false);
		}
		updateSelected(newSelected).then(() => {
			if (finalSave) {
				toast.success(
					editingMobile ? "Mobile layout saved" : "Profile saved"
				);
			}
		});
	};

	const dragStart = (l, placeholder, e) => {
		setDragging(true);
		setOldLayout(l);
		setUndoStack([...undoStack, l]);
	};

	const drag = (placeholder, e, node) => {
		// let gridItems = document.getElementsByClassName("react-grid-item");
		// var style = window.getComputedStyle(gridItems[0]);
		// var matrix = new WebKitCSSMatrix(style.transform);
		// var x = matrix.m41;
		// var y = matrix.m42;
		// gridItems[0].style.transform = `translate(${e.clientX}px)`;
		setPlaceHolder({ ...placeholder, static: false });
	};

	const searchCompact = (val) => {
		if (val.trim() != "") {
			setCompact("vertical");
		} else {
			setCompact(null);
		}
	};

	const updateCard = async (item, x, y, zoom) => {
		let cardIndex = nfts.findIndex((el) => el._id == item._id);
		let newNftGrid = [...nfts];
		newNftGrid[cardIndex].background_x = x;
		newNftGrid[cardIndex].background_y = y;
		newNftGrid[cardIndex].background_zoom = zoom;
		try {
			const response = await fetcher("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					selected: newNftGrid,
					type: "nft",
				}),
			});
			mutate({ user: response.user }, false);
			setNftGrid(response.user.selected);
			toast.success("Card updated");
			return response;
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
			return;
		}
	};

	return (
		<div>
			<div
				className="flex items-center mb-6 mx-auto w-full justify-end md:justify-between flex-wrap"
				style={{ width: containerId == null ? "100%" : "90%" }}
			>
				<div className="relative mt-1 py-3 rounded-2xl">
					{search && (
						<Searchbar
							disabled={multiSelecting || editing}
							placeholder="Search"
							type="text"
							onChange={(e) => {
								searchCompact(e.target.value);
								search(e.target.value);
							}}
						/>
					)}
				</div>
				<div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
					{nfts.length === 0 &&
						!editing &&
						!multiSelecting &&
						currentUser === user._id && (
							<div
								className="group flex flex-col items-center cursor-pointer"
								onClick={showModal}
							>
								<Icon icon={<HiOutlineViewGridAdd />} />
								<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
									Add NFTs
								</div>
							</div>
						)}
					{editing && !multiSelecting && (
						<div
							className="group flex flex-col items-center cursor-pointer"
							onClick={showModal}
						>
							<Icon icon={<HiOutlineViewGridAdd />} />
							<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
								Add NFTs
							</div>
						</div>
					)}
					{/* {editing && containerId == null && !multiSelecting && (
						<Icon
							onClick={newContainer}
							icon={<BiMessageSquareAdd />}
						/>
					)} */}
					{editing && !multiSelecting && (
						<Icon
							onClick={undo}
							icon={<CgUndo />}
							disabled={undoStack.length == 0}
						/>
					)}
					{editing && !multiSelecting && (
						<Icon
							onClick={redo}
							icon={<CgRedo />}
							disabled={redoStack.length == 0}
						/>
					)}
					{multiSelecting && editing && (
						<div
							className="group flex flex-col items-center cursor-pointer"
							onClick={hide}
						>
							<Icon icon={<AiFillEyeInvisible />} />
							<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
								Hide
							</div>
						</div>
					)}
					{multiSelecting && editing && (
						<div
							className="group flex flex-col items-center cursor-pointer"
							onClick={allSelected ? deselectAll : selectAll}
						>
							<Icon
								icon={
									allSelected ? (
										<MdOutlineCancel />
									) : (
										<BiSelectMultiple />
									)
								}
							/>
							<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
								{allSelected ? "Undo" : "Select all"}
							</div>
						</div>
					)}
					{editing && !multiSelecting && (
						<div
							className="group flex flex-col items-center cursor-pointer"
							onClick={multiSelect}
						>
							<Icon icon={<RiCheckboxMultipleFill />} />
							<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
								Multiselect
							</div>
						</div>
					)}
					{editing && multiSelecting && (
						<div className="flex gap-x-2">
							<div
								className="group flex flex-col items-center cursor-pointer"
								onClick={increaseSize}
							>
								<Icon icon={<AiOutlinePlusCircle />} />
								<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
									Increase size
								</div>
							</div>
							<div
								className="group flex flex-col items-center cursor-pointer"
								onClick={decreaseSize}
							>
								<Icon icon={<AiOutlineMinusCircle />} />
								<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
									Decrease size
								</div>
							</div>
						</div>
					)}
					<div
						className="group flex flex-col items-center cursor-pointer"
						onClick={compactGrid}
					>
						{editing && !multiSelecting && containerId == null && (
							<Icon
								icon={
									compact == "vertical" ? (
										<CgUndo />
									) : (
										<ImMoveUp />
									)
								}
							/>
						)}
						<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
							{compact != "vertical" ? "Move up" : "Undo"}
						</div>
					</div>
					<div
						className="group flex flex-col items-center cursor-pointer"
						onClick={editing ? () => saveGrid(layout, true) : edit}
					>
						<Icon
							colour="primary"
							ref={editButton}
							icon={
								currentUser === user._id ? (
									editing ? (
										<BsCheckSquare />
									) : (
										<FiEdit />
									)
								) : null
							}
						/>
						<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
							{editing ? "Save" : "Edit"}
						</div>
					</div>
					{size.width > 600 && containerId == null && (
						<div
							className="group flex flex-col items-center cursor-pointer"
							onClick={editMobile}
						>
							<Icon
								icon={
									currentUser === user._id ? (
										!editingMobile ? (
											<AiOutlineMobile />
										) : (
											<AiOutlineLaptop />
										)
									) : null
								}
							/>
							<div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in top-0 text-xs">
								{editingMobile ? "Desktop" : "Mobile"}
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="relative w-full h-full pb-28">
				<div
					className={`absolute left-0 right-0 mx-auto h-full grid auto-cols-auto items-center justify-center`}
					style={{
						gridAutoRows: rowHeight + "px",
						gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr)`,
						rowGap: rowGap + "px",
						columnGap: columnGap + "px",
						width: gridWidth,
					}}
				>
					{editing &&
						gridBoxes.map((n, i) => {
							return (
								<div
									key={i}
									className={`border-2 w-full bg-white h-full shadow-md ${
										containerId == null ? `rounded-2xl` : ``
									}`}
								></div>
							);
						})}
				</div>
				<div className="min-h-[200px]">
					<GridLayout
						className="layout mx-auto left-0 right-0"
						style={{
							width: gridWidth,
						}}
						layout={layout}
						isDraggable={editing}
						isResizable={editing}
						resizeHandles={editing && !multiSelecting ? ["se"] : []}
						compactType={compact}
						rowHeight={rowHeight}
						containerPadding={[0, 0]}
						margin={[columnGap, rowGap]}
						width={gridWidth}
						onDragStart={(layout, placeholder, e) =>
							dragStart(layout, placeholder, e)
						}
						onDrag={(
							layout,
							oldDragItem,
							l,
							placeholder,
							e,
							node
						) => drag(placeholder, e, node)}
						onDragStop={(layout, e) => {
							setDragging(false);
							repositionGridOnDrag(layout, e);
						}}
						onResizeStart={(layout, placeholder, e) => {
							dragStart(layout, placeholder, e);
						}}
						onResize={(
							layout,
							oldDragItem,
							l,
							placeholder,
							e,
							node
						) => drag(placeholder, e, node)}
						onResizeStop={(layout, e) => {
							setDragging(false);
							repositionGridOnDrag(layout, e);
							setCompact(null);
						}}
						onLayoutChange={(layout) => updateIfCompacted(layout)}
						cols={columns}
						allowOverlap={containerId != null}
					>
						{layout &&
							nfts &&
							nfts.map((item, i) => {
								// if (item._id?.startsWith("container")) {
								// 	return (
								// 		<div
								// 			key={item._id}
								// 			className={`relative rounded-2xl opacity-100 ${
								// 				editing && `shadow-2xl`
								// 			}`}
								// 			data-grid={layout[item._id]}
								// 		>
								// 			<GridContainer
								// 				user={user}
								// 				container={item}
								// 				nameHeight={rowHeight}
								// 				gap={rowGap}
								// 				editing={editing}
								// 				multiSelecting={multiSelecting}
								// 				open={open}
								// 				mutate={mutate}
								// 				multiSelectedCards={
								// 					multiSelectedCards
								// 				}
								// 				setMultiSelectedCards={
								// 					setMultiSelectedCards
								// 				}
								// 				editContainer={() =>
								// 					editContainer(item)
								// 				}
								// 				gridCols={columns}
								// 			/>
								// 			{editing && (
								// 				<div
								// 					className="cursor-pointer absolute top-2 left-2 text-2xl rounded-full bg-white text-red-500"
								// 					onClick={() =>
								// 						confirmHide(item)
								// 					}
								// 				>
								// 					<IoIosClose />
								// 				</div>
								// 			)}
								// 		</div>
								// 	);
								// } else {
								return (
									<div
										key={item._id}
										data-grid={layout[item._id]}
									>
										<Card
											user={user}
											item={item.data ? item.data : item}
											nameHeight={rowHeight}
											gap={rowGap}
											editing={editing}
											multiSelecting={multiSelecting}
											open={open}
											click={() => like(item._id)}
											mutate={mutate}
											multiSelectedCards={
												multiSelectedCards
											}
											setMultiSelectedCards={
												setMultiSelectedCards
											}
											updateCard={updateCard}
											backgroundX={item.background_x}
											backgroundY={item.background_y}
											backgroundZoom={
												item.background_zoom
											}
											dragging={dragging}
											appreciate={
												!editing && containerId == null
											}
											inContainer={containerId != null}
										/>
									</div>
								);
								// }
							})}
					</GridLayout>
				</div>
			</div>
		</div>
	);
}

export default withSize({ monitorHeight: true })(NftGrid);
