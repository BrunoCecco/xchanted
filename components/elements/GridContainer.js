import LazyLoad from "react-lazyload";
import { IoIosCheckmark } from "react-icons/io";
import { useState, useCallback, useEffect } from "react";
import { withSize } from "react-sizeme";
import NftImage from "../nft/NftImage";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import ReactGridLayout from "react-grid-layout";
import Card from "../nft/card";

function GridContainer({
	size,
	user,
	container,
	mutate,
	editing,
	multiSelecting,
	multiSelectedCards,
	setMultiSelectedCards,
	editContainer,
	gridCols,
}) {
	const [isSelected, toggleIsSelected] = useToggle(
		multiSelectedCards &&
			multiSelectedCards.findIndex((x) => x === container._id) > -1
	);
	const [h, setH] = useState(Math.round((100 / container?.nfts?.length) * 2));
	const [w, setW] = useState(Math.round((100 / container?.nfts?.length) * 2));
	const [layout, setLayout] = useState(generateLayout());
	const [name, setName] = useState(container.name);

	useEffect(() => {
		if (
			multiSelectedCards.findIndex((x) => x === container._id) == -1 &&
			isSelected
		) {
			toggleIsSelected();
		} else if (
			multiSelectedCards.findIndex((x) => x === container._id) > -1 &&
			!isSelected
		) {
			toggleIsSelected();
		}
	});

	useEffect(() => {
		let newLayout = generateLayout();
		setLayout(newLayout);
	}, [container.nfts]);

	useEffect(() => {
		setName(container.name);
	}, [container.name]);

	function generateLayout() {
		let currX = 0;
		let l =
			container &&
			container.nfts?.map((nft, i) => {
				if (
					nft.gridData &&
					nft.gridData.x != -1 &&
					nft.gridData.y != -1
				) {
					currX = (currX + nft.gridData.w) % 12;
					return { ...nft.gridData, i: nft._id };
				} else {
					let obj = { i: nft._id, x: currX, y: 0, w: 3, h: 4 };
					currX = (currX + 3) % gridCols;
					return obj;
				}
			});
		return l;
	}

	const select = () => {
		toggleIsSelected();
		if (
			multiSelectedCards &&
			multiSelectedCards.findIndex((el) => el === container._id) != -1
		) {
			setMultiSelectedCards(
				multiSelectedCards.filter((el) => el !== container._id)
			);
		} else if (setMultiSelectedCards) {
			setMultiSelectedCards([...multiSelectedCards, container._id]);
		}
	};

	const { width, height } = size;

	useEffect(() => {
		setName(container.name);
	}, [container]);

	return (
		<div className="h-full w-full relative group">
			<div
				className={`relative rounded-2xl shadow-lg hover:shadow-2xl duration-300  transition-shadow dark:bg-gray-800 dark:border-gray-700 w-full h-full ${
					multiSelecting ? ` drop-shadow-2xl` : ``
				}`}
				onClick={multiSelecting ? select : null}
			>
				{isSelected && multiSelecting ? (
					<div className="absolute top-1 right-3 text-xs rounded-full flex items-center justify-center text-white z-100 cursor-pointer">
						<IoIosCheckmark
							size={64}
							className="bg-primary h-8 w-8 rounded-full"
						/>
					</div>
				) : multiSelecting ? (
					<div className="absolute top-1 right-3 text-xs rounded-full flex items-center justify-center text-white z-100 cursor-pointer">
						<IoIosCheckmark
							size={64}
							className="bg-white h-8 w-8 rounded-full"
						/>
					</div>
				) : null}
				<div
					className={`w-full relative -z-50 bg-white h-full overflow-hidden rounded-2xl`}
				>
					<ReactGridLayout
						className="layout"
						layout={layout}
						isDraggable={false}
						isResizable={false}
						resizeHandles={[]}
						compactType={null}
						containerPadding={[0, 0]}
						margin={[0, 0]}
						rowHeight={size.height / 6}
						width={size.width}
						cols={gridCols}
						allowOverlap
					>
						{layout &&
							container.nfts &&
							container.nfts.map((item, i) => {
								return (
									<div
										key={item._id}
										className={`relative z-50 opacity-100`}
										data-grid={
											layout[item._id] || item.gridData
										}
									>
										<Card
											user={user}
											item={item.data ? item.data : item}
											editing={false}
											multiSelecting={false}
											open={() => null}
											click={() => null}
											mutate={mutate}
											multiSelectedCards={[]}
											setMultiSelectedCards={() => null}
											appreciate={false}
											inContainer={true}
										/>
									</div>
								);
							})}
					</ReactGridLayout>
				</div>
				{!editing && (
					<div
						className={`z-50 rounded-b-2xl bg-gradient-to-t from-black to-transparent pt-6 pb-2 w-full absolute bottom-0 items-end justify-center text-xs text-white h-auto hidden group-hover:flex`}
					>
						<div className="flex items-center justify-center text-center tracking-tight bg-none dark:text-white w-full h-full text-xs">
							<div className="m-auto line-clamp-2">{name}</div>
						</div>
					</div>
				)}
			</div>
			{editing && (
				<div
					className="absolute -top-[1rem] -right-[1.2rem] bg-white p-2 rounded-full text-primary hover:opacity-75 text-xl cursor-pointer"
					onClick={editContainer}
				>
					<FaEdit />
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

export default withSize({ monitorHeight: true })(GridContainer);
