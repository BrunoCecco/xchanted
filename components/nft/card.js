import LazyLoad from "react-lazyload";
import Appreciate from "./appreciate";
import { FiEdit } from "react-icons/fi";
import { MdCheck } from "react-icons/md";
import { BsArrowsMove } from "react-icons/bs";
import { GrPowerReset } from "react-icons/gr";
import { useState, useCallback, useEffect, useRef } from "react";
import { withSize } from "react-sizeme";
import NftImage from "./NftImage";
import Icon from "../elements/Icon";

function Card({
	size,
	user,
	currentUser,
	item,
	open,
	click,
	mutate,
	editing,
	multiSelecting,
	multiSelectedCards,
	setMultiSelectedCards,
	updateCard,
	backgroundX,
	backgroundY,
	backgroundZoom,
	dragging,
	appreciate = true,
	inContainer = false,
}) {
	const [isSelected, toggleIsSelected] = useToggle(
		multiSelectedCards &&
			multiSelectedCards.findIndex((x) => x === item._id) > -1
	);
	const [bgX, setBgX] = useState(backgroundX ? backgroundX : 0);
	const [bgY, setBgY] = useState(backgroundY ? backgroundY : 0);
	const [startX, setStartX] = useState(0);
	const [startY, setStartY] = useState(0);
	const [startMouseX, setStartMouseX] = useState(0);
	const [startMouseY, setStartMouseY] = useState(0);
	const [bgZoom, setBgZoom] = useState(backgroundZoom ? backgroundZoom : 100);
	const [editingCard, setEditingCard] = useState(false);
	const [currSize, setCurrSize] = useState(size);
	const [nftNumber, setNftNumber] = useState(null);
	const [nftName, setNftName] = useState(null);
	const [likesDisplay, setLikesDisplay] = useState("none");
	const [displayLikes, setDisplayLikes] = useState(false);
	const slider = useRef(null);
	const card = useRef(null);
	const [showEdit, setShowEdit] = useState(false);

	const { width, height } = size;

	// regex to match a number preceeded by a hashtag in the name
	const regex = /#[1-9]\d*\b/;

	useEffect(() => {
		if (inContainer) {
			setNftNumber(null);
			setNftName(null);
		} else {
			setNftNumber(
				item.metadata?.name?.match(regex) || item?.name?.match(regex)
			);
			setNftName(
				item.metadata?.name?.toString().replace(/\s(?:#\d+)/, "") ||
					item?.name?.toString().replace(/\s(?:#\d+)/, "")
			);
		}
	}, [size]);

	useEffect(() => {
		if (!inContainer) {
			setNftNumber(
				item.metadata?.name?.match(regex) || item?.name?.match(regex)
			);
			setNftName(
				item.metadata?.name?.toString().replace(/\s(?:#\d+)/, "") ||
					item?.name?.toString().replace(/\s(?:#\d+)/, "")
			);
		}

		card.current.addEventListener("mouseenter", () => {
			setLikesDisplay("block");
			setDisplayLikes(true);
			setShowEdit(true);
		});

		card.current.addEventListener("mouseleave", () => {
			setLikesDisplay("none");
			setDisplayLikes(false);
			setShowEdit(false);
		});
	}, []);

	useEffect(() => {
		if (size.width != currSize.width || size.height != currSize.height) {
			if (dragging && bgX != 0 && bgY != 0) {
				setBgY(0);
				setBgX(0);
			}
			setCurrSize(size);
		} else if (!dragging) {
			setBgX(backgroundX ? backgroundX : 0);
			setBgY(backgroundY ? backgroundY : 0);
		}
	}, [size]);

	useEffect(() => {
		if (
			multiSelectedCards &&
			multiSelectedCards.findIndex((x) => x === item._id) == -1 &&
			isSelected
		) {
			toggleIsSelected();
		} else if (
			multiSelectedCards &&
			multiSelectedCards.findIndex((x) => x === item._id) > -1 &&
			!isSelected
		) {
			toggleIsSelected();
		}
	});

	const select = () => {
		toggleIsSelected();
		if (
			multiSelectedCards &&
			multiSelectedCards.findIndex((el) => el === item._id) != -1
		) {
			setMultiSelectedCards(
				multiSelectedCards.filter((el) => el !== item._id)
			);
		} else if (setMultiSelectedCards) {
			setMultiSelectedCards([...multiSelectedCards, item._id]);
		}
	};

	const updateBg = async (e) => {
		e?.preventDefault();
		console.log("FINAL", bgX, bgY);
		let res = await updateCard(item, bgX, bgY, bgZoom);
	};

	const drag = (e) => {
		e.preventDefault();
		// update bgx and bgy based on mouse position and start x and y
		let newX = startX + e.clientX - startMouseX;
		let newY = startY + e.clientY - startMouseY;
		if (Math.abs(newX - bgX) < 10 && Math.abs(newY - bgY) < 10) {
			setBgX(newX);
			setBgY(newY);
		}
	};

	// const updateZoom = async () => {
	//   let res = await updateCard(item, bgX, bgY, bgZoom);
	// };

	// const zoom = (newVal) => {
	//   setBgZoom(newVal);
	// };

	const resetCard = async () => {
		setBgX(0);
		setBgY(0);
		setBgZoom(100);
		let res = await updateCard(item, 0, 0, 100);
	};

	return (
		<div
			className={`relative h-full w-full group ${
				!inContainer && `rounded-2xl`
			} ${multiSelecting ? ` drop-shadow-2xl` : ``} ${
				editing && ` opacity-75`
			}`}
			onClick={multiSelecting ? select : null}
			ref={card}
		>
			{isSelected && multiSelecting ? (
				<div className="absolute top-1 left-1 text-xs rounded-full flex items-center justify-center text-white z-100 cursor-pointer h-6 w-6 bg-primary">
					<Icon icon={<MdCheck />} size="sm" />
				</div>
			) : multiSelecting ? (
				<div className="absolute top-1 left-1 text-xs rounded-full flex items-center justify-center text-white z-100 cursor-pointer bg-white h-6 w-6"></div>
			) : null}
			<div
				onClick={multiSelecting || editing ? null : () => open(item)}
				className={`w-full h-full`}
			>
				{(item?.metadata?.image || item?.metadata?.imgopti) && (
					<LazyLoad
						height={200}
						offset={150}
						className={`h-full w-full active:cursor-grabbing ${
							editing ? `cursor-grab` : `cursor-pointer`
						}`}
					>
						<NftImage
							metadata={item.metadata}
							classname={`${
								!inContainer && `rounded-2xl`
							} w-full h-full overflow-hidden bg-cover bg-center shadow-lg hover:shadow-2xl duration-300 transition-shadow`}
							style={{
								backgroundPosition:
									bgX == 0 && bgY == 0
										? "center"
										: `${bgX}px ${bgY}px`,
								// backgroundSize: bgZoom == 100 ? `` : `${bgZoom}%`,
							}}
							click={() => {}}
						/>
					</LazyLoad>
				)}
			</div>
			{appreciate && item && (
				<Appreciate
					user={user}
					item={item}
					type={"nfts"}
					click={click}
					mutate={mutate}
					likesDisplay={likesDisplay}
					displayLikes={displayLikes}
				/>
			)}
			{!inContainer && !editing && width > 80 && height > 80 && (
				<div
					className={`z-50 cursor-pointer rounded-b-2xl bg-gradient-to-t from-black to-transparent p-2 pt-6 w-full absolute bottom-0 items-end justify-center text-xs text-white h-auto hidden group-hover:flex`}
					onClick={
						multiSelecting || editing ? null : () => open(item)
					}
				>
					{nftName || nftNumber ? (
						<div className="break-all text-center">
							<span className="line-clamp-1">{nftName}</span>
							<span className="text-gray-300 line-clamp-1">
								{nftNumber?.toString().replace("#", "NO. ")}
							</span>
						</div>
					) : null}
				</div>
			)}
			{/* <div className="absolute w-full" style={{ bottom: nameHeight + "px" }}>
        <input
          type="range"
          min={100}
          max={200}
          onChange={(e) => zoom(e.target.value)}
          onBlur={updateZoom}
          className={`w-full slider ${!editingCard && `hidden`}`}
          ref={slider}
        />
      </div> 
			{currentUser === user?.id && !inContainer && !editing && showEdit && (
				<div className="flex items-center justify-center gap-x-1 absolute top-3 left-3">
					<div className="bg-white rounded-full p-1 flex items-center justify-center">
						<Icon
							icon={editingCard ? <MdCheck /> : <FiEdit />}
							onClick={() => setEditingCard(!editingCard)}
							size={"sm"}
						/>
					</div>
					{editingCard && (
						<div className="bg-white rounded-full p-1 flex items-center justify-center">
							<Icon
								icon={<GrPowerReset />}
								onClick={resetCard}
								size={"sm"}
							/>
						</div>
					)}
				</div>
			)}
			{!inContainer && editingCard && (
				<div
					className="bg-white cursor-move active:cursor-move absolute translate-y-[-50%] top-[50%] left-0 right-0 p-1 h-6 w-6 mx-auto rounded-full hover:scale-110"
					onDragStart={(e) => {
						setStartX(bgX);
						setStartY(bgY);
						setStartMouseX(e.clientX);
						setStartMouseY(e.clientY);
					}}
					onDrag={drag}
					onDragEnd={updateBg}
					draggable={true}
				>
					<BsArrowsMove className="w-full h-full" />
				</div>
			)}*/}
		</div>
	);
}

const useToggle = (initialState = false) => {
	// Initialize the state
	const [selected, setSelected] = useState(initialState);

	// Define and memorize toggler function in case we pass down the component,
	// This function change the boolean value to its opposite value
	const toggle = useCallback(() => setSelected((selected) => !selected), []);

	return [selected, toggle];
};

export default withSize({ monitorHeight: true })(Card);
