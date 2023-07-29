import { useState, useEffect, useRef, useCallback } from "react";
import styles from "../../styles/Modal.module.css";
import ReactDOM from "react-dom";
import { IoIosClose, IoIosCheckmark } from "react-icons/io";
import { useCurrentUser } from "../../lib/user";
import { SearchIcon } from "@heroicons/react/outline";
import NFTCard from "../../components/nft/NFTCard";
import { fetcher } from "../../lib/fetch";
import toast from "react-hot-toast";
import NftImage from "../nft/NftImage";
import ReactGridLayout from "react-grid-layout";
import Card from "../nft/card";
import NftGrid from "../nft/NftGrid";
import Input from "../elements/Input";
import Icon from "../elements/Icon";
import Modal from "../modals/Modal";
import ModalContent from "../modals/ModalContent";
import ModalHeader from "../modals/ModalHeader";

function GridContainerModal(props) {
	const { data, error, mutate } = useCurrentUser();
	const [nftGrid, setNftGrid] = useState(props.nfts);
	const [nameEdited, setNameEdited] = useState(false);
	const [container, setContainer] = useState(props.container);

	const nameRef = useRef();

	useEffect(() => {
		setNftGrid(props.nfts);
	}, [props.nfts]);

	useEffect(() => {
		if (nameRef.current) {
			nameRef.current.value = container?.name || "";
		}
	}, [container?.name]);

	const updateContainerSelected = async (newContainerSelected) => {
		let res = await props.updateSelected(
			newContainerSelected,
			container?._id
		);
		return res;
	};

	const saveName = async (e) => {
		if (e) e.preventDefault();
		setNameEdited(false);
		let res = await props.updateSelected(
			null,
			container?._id,
			nameRef.current.value,
			true
		);
		toast.success("Container updated.");
	};

	return (
		<Modal className={styles.containerModal}>
			<ModalHeader
				close={props.close}
				heading={
					<form onSubmit={saveName}>
						<Input
							name="containerName"
							type="text"
							size="lg"
							className="text-center"
							placeholder="Container Name"
							ref={nameRef}
							onChange={(e) => {
								setNameEdited(true);
							}}
							onBlur={saveName}
						/>
					</form>
				}
			></ModalHeader>
			<ModalContent>
				<div className="relative h-full w-full p-6">
					{nftGrid && (
						<NftGrid
							nfts={nftGrid}
							user={props.user}
							currentUser={data?.user?._id}
							open={() => null}
							like={() => null}
							mutate={mutate}
							showModal={props.showModal}
							search={null}
							setNftGrid={setNftGrid}
							setSelected={props.setSelectedNFTCards}
							updateSelected={updateContainerSelected}
							gridCols={18}
							rowH={11}
							colW={65}
							containerId={container?._id}
							isEditing={true}
						/>
					)}
				</div>
			</ModalContent>
		</Modal>
	);
}

export default GridContainerModal;
