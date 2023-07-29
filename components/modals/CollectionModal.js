import { useState, useEffect, useRef, useCallback } from "react";
import { useCurrentUser } from "../../lib/user";
import { fetcher } from "../../lib/fetch";
import { IoIosClose } from "react-icons/io";
import { SearchIcon } from "@heroicons/react/outline";
import Searchbar from "../elements/Searchbar";
import Icon from "../elements/Icon";
import Modal from "./Modal";
import ModalContent from "./ModalContent";
import ModalHeader from "./ModalHeader";
import styles from "../../styles/Modal.module.css";

export default function CollectionModal(props) {
	const [collections, setCollections] = useState([]);
	const [allCollections, setAllCollections] = useState([]);
	const [selected, setSelected] = useState(data?.user?.selectedCollections);
	const { data, error, mutate } = useCurrentUser();

	useEffect(() => {
		if (!data && !error) return; // useCurrentUser might still be loading
		setSelected(data.user?.selectedCollections);
	}, [data, error]);

	useEffect(() => {
		setCollections(props.userCollections);
		setAllCollections(props.userCollections);
	}, [props.userCollections]);

	const insert = (arr, index, newItem) => [
		// part of the array before the specified index
		...arr.slice(0, index),
		// inserted item
		newItem,
		// part of the array after the specified index
		...arr.slice(index),
	];

	const select = (item) => {
		const temp = selected;
		if (item == "remove" && temp) {
			temp.splice(props.sortNum, 1);
			setSelected(temp);
			props.saveSelectedCollections(temp);
		} else if (temp && temp.length < 3) {
			const result = insert(temp, props.sortNum, item);
			setSelected(result);
			props.saveSelectedCollections(result);
		} else if (temp) {
			temp.splice(props.sortNum, 1, item);
			setSelected(temp);
			props.saveSelectedCollections(temp);
		}
		props.close();

		/*if(selected.length > 0 && selected.findIndex(el => el._id === item._id) != -1) {
      setSelected(selected.filter(el => el._id !== item._id));
    } else if(selected.length < 3) {
      const obj = {
        _id: item._id,
        image_url: item.image_url,
        name: item.name,
      }
      setSelected([...selected, obj]);
    }*/
	};

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
		console.log(collections);
		setCollections(searched);
	}

	return (
		<Modal className={styles.collectionModal}>
			<ModalHeader heading="Your Collections" close={props.close} />
			<ModalContent>
				<div className="p-6">
					<Searchbar
						placeholder="Search Collections"
						type="text"
						onChange={(e) => searchCollections(e.target.value)}
					/>
				</div>
				<div className="p-6 gap-y-2 flex flex-wrap overflow-y-auto h-full pb-[30%]">
					<div
						key={0}
						className="relative text-white hover:text-black flex justify-between items-center w-full"
						onClick={() => select("remove")}
					>
						<div className="flex h-full items-center w-full hover:shadow-lg duration-300 border-gray-200 transition-shadow rounded-lg cursor-pointer gap-x-2">
							<div className="h-12 w-12 rounded-full overflow-hidden bg-center bg-cover border-2" />
							<div className="basis-3/4 text-black px text-left font-bold line-clamp-1">
								None
							</div>
						</div>
					</div>
					{collections.length > 0 &&
						collections.map((col) => (
							<div
								key={col._id}
								className={`${
									selected?.length > 0 &&
									selected.findIndex(
										(el) => el._id === col._id
									) != -1
										? "hidden"
										: "relative text-white hover:text-black flex justify-between items-center w-full"
								}`}
								onClick={() => select(col)}
							>
								<div className="flex h-full items-center w-full hover:shadow-lg duration-300 border-gray-200 transition-shadow rounded-lg cursor-pointer gap-x-2">
									<div
										className="h-12 w-12 rounded-full overflow-hidden bg-center bg-cover"
										style={{
											backgroundImage: `url(${col.image_url})`,
										}}
									/>

									<div className="basis-3/4 text-black px text-left font-bold line-clamp-1">
										{col.name?.includes("Unidentified")
											? userNfts.find((el) =>
													el._id.includes(col._id)
											  ).metadata.name
											: col.name}
									</div>
								</div>
							</div>
						))}
				</div>
			</ModalContent>
		</Modal>
	);
}
