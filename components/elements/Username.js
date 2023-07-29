import { forwardRef } from "react";
import CollectionIcon from "./CollectionIcon";
import Link from "next/link";

const Username = forwardRef(function Username(
	{ size, user, colour, center = false, showBadges = true },
	ref
) {
	return (
		<div
			className={`flex flex-col md:items-start ${
				center ? `items-center` : `items-start`
			}`}
		>
			<div className="flex items-center justify-start gap-2 break-words">
				<div
					className={`font-extrabold ${size == "lg" && `text-2xl`} ${
						size == "sm" && `text-sm`
					}`}
				>
					{user?.name}
				</div>
				{showBadges && (
					<div className="flex items-center justify-center gap-1">
						{user?.selectedCollections?.map((col, index) => (
							<CollectionIcon
								key={"commentColIcon" + index}
								collection={col}
							/>
						))}
					</div>
				)}
			</div>
			<Link href={`/@${user?.username}`} passHref>
				<a
					className={`text-gray-500 hover:text-primary cursor-pointer text-${colour} hover:text-${colour} ${
						size == "sm" && `text-sm`
					}`}
				>
					@
					{user?.usernameNFT?.name
						? user.usernameNFT.name
						: user?.username}
				</a>
			</Link>
		</div>
	);
});

export default Username;
