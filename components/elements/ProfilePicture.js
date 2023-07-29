import NftImage from "../nft/NftImage";
import { CgProfile } from "react-icons/cg";
import Link from "next/link";

const Pic = ({ user }) => {
	return (
		<div className="w-full h-full rounded-2xl flex items-center justify-center bg-primary">
			{user.profilePicture?.data?.metadata ? (
				<NftImage
					metadata={user.profilePicture?.data?.metadata}
					classname={
						"cursor-pointer rounded-2xl w-full h-full overflow-hidden bg-center bg-cover"
					}
				/>
			) : (
				<CgProfile size={48} />
			)}
		</div>
	);
};

export default function ProfilePicture({ user, onClick }) {
	return onClick ? (
		<div
			className="w-full h-full rounded-2xl flex items-center justify-center"
			onClick={onClick}
		>
			<Pic user={user} />
		</div>
	) : (
		<Link
			className="w-full h-full rounded-2xl flex items-center justify-center"
			href={`/@${user.username}`}
		>
			<a className="w-full h-full">
				<Pic user={user} />
			</a>
		</Link>
	);
}
