import styles from "../../styles/Modal.module.css";
import Modal from "./Modal";
import ModalContent from "./ModalContent";
import ModalHeader from "./ModalHeader";
import { IoIosClose } from "react-icons/io";
import Image from "next/image";

export default function AddWalletModal(props) {
	return (
		<Modal className="wallet-adapter-modal-wrapper !bg-white">
			<button
				className="wallet-adapter-modal-button-close"
				onClick={props.close}
			>
				<svg width="14px" height="14">
					<path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"></path>
				</svg>
			</button>
			<h1 className={`${styles.addWalletModalTitle} !text-black`}>
				Connet a wallet on Ethereum to continue
			</h1>
			<ul className="wallet-adapter-modal-list">
				{props.wallets.map((wallet, index) => {
					return (
						<li key={index}>
							<button
								className="wallet-adapter-button !text-black hover:opacity-75 hover:!bg-white "
								onClick={() => {
									props.add(wallet.name);
									props.close();
								}}
							>
								<i
									className="wallet-adapter-button-start-icon relative"
									style={{ width: "28px" }}
								>
									<Image
										layout="fill"
										objectFit="contain"
										src={wallet.logo.src}
										alt=""
									/>
								</i>
								{wallet.name}
								<span>Connect</span>
							</button>
						</li>
					);
				})}
			</ul>
		</Modal>
	);
}
