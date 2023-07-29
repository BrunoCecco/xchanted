import Modal from "./Modal";
import ModalContent from "./ModalContent";
import ModalHeader from "./ModalHeader";
import NftImage from "../nft/NftImage";
import styles from "../../styles/Modal.module.css";

export default function NftImageModal(props) {
	return (
		<Modal className={styles.nftModal}>
			<NftImage
				metadata={props.metadata}
				classname={
					"shadow-2xl cursor-pointer min-h-[50vh] min-w-[30vw] max-w-[80vw] max-h-[80vh] mx-auto bg-no-repeat bg-center relative"
				}
				inNftPage={true}
				inModal={true}
				showEverything={true}
				resolution={"original"}
			/>
		</Modal>
	);
}
