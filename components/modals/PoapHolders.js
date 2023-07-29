import Modal from "./Modal";
import ModalContent from "./ModalContent";
import ModalHeader from "./ModalHeader";
import Image from "next/image";
import Link from "next/link";
import { fetcher } from "../../lib/fetch";
import { useEffect, useState } from "react";
import UserTag from "../../components/elements/UserTag";
import ModalService from "./services/ModalService";
import { BiLeftArrow } from "react-icons/bi";
import Icon from "../elements/Icon";
import ClipLoader from "react-spinners/ClipLoader";
import { FiExternalLink } from "react-icons/fi";

export default function PoapHolders(props) {
	const [holders, setHolders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		const fetchData = async () => {
			try {
				const poapsResult = await fetcher(
					"/api/profile/poap/holders/" + props.poap?.event?.id,
					{
						method: "get",
					}
				);
				setHolders(poapsResult?.holders);
				setLoading(false);
			} catch (error) {
				console.log("error", error);
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<Modal>
			<ModalContent>
				<ModalHeader
					heading={
						<div className="flex gap-4 items-center">
							<div
								className="cursor-pointer hover:scale-110 transition duration-200"
								onClick={props.back}
							>
								<BiLeftArrow />
							</div>
							<div>Holders of {props.poap?.event.name}</div>
						</div>
					}
					close={props.close}
				></ModalHeader>
				<div className="flex gap-4 px-6 pb-6 items-center">
					<div className="w-36 h-36 relative basis-1/5">
						<Image
							src={props.poap?.event.image_url}
							className="rounded-full"
							objectFit="contain"
							layout="fill"
							alt=""
						/>
					</div>
					<div className="basis-4/5">
						<a
							href={props.poap?.event?.event_url}
							className="flex gap-2 font-bold text-2xl hover:text-primary"
						>
							{props.poap?.event?.name}
							<FiExternalLink size={20} />
						</a>
						<div className="font-normal text-gray-500">
							{props.poap?.event.description}
						</div>
					</div>
				</div>
				<div className="overflow-y-auto px-6 pb-20 h-[60%] w-full">
					<div className="font-bold text-gray-500 pb-4">Holders</div>
					<div className="grid grid-cols-2 gap-4 mx-auto">
						<ClipLoader color="#000" loading={loading} size={20} />{" "}
						{holders.length > 0 &&
							holders.map((user, index) => (
								<UserTag
									key={user._id}
									user={user}
									isFollowing={
										user.requesterFollowingThisUser
									}
								/>
							))}
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
