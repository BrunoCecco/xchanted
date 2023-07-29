import Modal from "./Modal";
import ModalContent from "./ModalContent";
import ModalHeader from "./ModalHeader";
import Image from "next/image";
import Link from "next/link";
import ModalService from "./services/ModalService.js";
import PoapHolders from "./PoapHolders";
import Button from "../elements/Button";

export default function PoapsModal(props) {
	function showHolders(poap) {
		ModalService.open(PoapHolders, {
			poap: poap,
			back: props.back,
		});
	}

	return (
		<Modal>
			<ModalContent>
				<ModalHeader
					heading={`POAPS owned by ${props.user.username}`}
					close={props.close}
				/>
				<div className="overflow-y-auto px-6 pb-6 text-center h-[85%] w-full">
					<div
						className="relative grid gap-6 w-full h-full"
						style={{
							gridTemplateColumns: `repeat(auto-fit, minmax(9vw,1fr))`,
							gridTemplateRows: `repeat(auto-fit, 9vw)`,
						}}
					>
						{props.poaps.map((poap, index) => (
							<div key={index}>
								<div
									className="w-full h-full relative cursor-pointer"
									onClick={() => showHolders(poap)}
								>
									<Image
										src={poap.event.image_url}
										className="rounded-full"
										layout="fill"
										objectFit="contain"
										alt=""
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
