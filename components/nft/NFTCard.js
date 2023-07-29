import React from "react";
import LazyLoad from "react-lazy-load";
import { useState, useCallback, useEffect } from "react";
import { IoIosCheckmark } from "react-icons/io";
import NftImage from "./NftImage";

export default function NFTCard({
	item,
	closeModal,
	selectOne,
	setSelectedNFTCards,
	selectedNFTCards,
	setSelectedNFTCard,
	setSelectedBannerNFT,
	selectingBanner,
}) {
	const [isSelected, toggleIsSelected] = useToggle(
		selectedNFTCards &&
			selectedNFTCards.find((x) => x._id === item._id) != undefined
	);
	const [nftName, setNftName] = useState(null);
	const [nftNumber, setNftNumber] = useState(null);

	const regex = /#[1-9]\d*\b/;

	useEffect(() => {
		setNftNumber(
			item.metadata?.name?.toString().match(regex) ||
				item?.name?.toString().match(regex)
		);
		setNftName(
			item.metadata?.name?.toString().replace(/\s(?:#\d+)/, "") ||
				item?.name?.toString().replace(/\s(?:#\d+)/, "")
		);
	}, []);

	useEffect(() => {
		let isNewlySelected =
			selectedNFTCards &&
			selectedNFTCards.find((x) => x._id === item._id) != undefined;
		if (isSelected && !isNewlySelected) {
			toggleIsSelected(false);
		} else if (!isSelected && isNewlySelected) {
			toggleIsSelected(true);
		}
	}, [item._id, selectedNFTCards]);

	const click = () => {
		toggleIsSelected();
		console.log(selectedNFTCards);
		if (selectOne && !isSelected) {
			if (selectingBanner) {
				setSelectedBannerNFT({
					_id: item._id,
					data: item,
				});
			} else {
				setSelectedNFTCard({
					_id: item._id,
					data: item,
				});
			}
			closeModal();
		} else {
			if (
				selectedNFTCards &&
				selectedNFTCards.findIndex((el) => el._id === item._id) != -1
			) {
				setSelectedNFTCards(
					selectedNFTCards.filter((el) => el._id !== item._id)
				);
			} else if (setSelectedNFTCards) {
				if (selectedNFTCards) {
					setSelectedNFTCards([...selectedNFTCards, item]);
				} else {
					setSelectedNFTCards([item]);
				}
			}
		}
	};

	return (
		<div
			className="relative flex flex-col justify-between h-full w-full"
			onClick={click}
		>
			<div className="overflow-hidden h-[80%] rounded-2xl cursor-pointer shadow-xl hover:drop-shadow-2xl duration-300 transition-shadow">
				{(item?.metadata?.image || item?.metadata?.imgopti) && (
					<LazyLoad offset={100} className="w-full h-full">
						<NftImage
							metadata={item.metadata}
							classname="rounded-2xl w-full h-full overflow-hidden bg-center bg-cover"
							click={null}
						/>
					</LazyLoad>
				)}
			</div>
			<div
				className={`z-50 py w-[80%] h-[15%] left-0 right-0 mx-auto text-center text-sm tracking-tight dark:text-white font-poppins`}
			>
				{nftName || nftNumber ? (
					<div className="break-all">
						<span className="line-clamp-1">{nftName}</span>
						<span className="text-gray-500 line-clamp-1 relative -top-1">
							{nftNumber?.toString().replace("#", "NO. ")}
						</span>
					</div>
				) : null}
			</div>
			{isSelected ? (
				<div className="absolute top-1 left-1 text-xs rounded-full flex items-center justify-center text-white z-100">
					<IoIosCheckmark
						size={64}
						className="bg-primary h-8 w-8 rounded-full"
					/>
				</div>
			) : (
				<div className="absolute top-1 left-1 text-xs rounded-full flex items-center justify-center text-white z-100">
					<IoIosCheckmark
						size={64}
						className="bg-white h-8 w-8 rounded-full"
					/>
				</div>
			)}
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
