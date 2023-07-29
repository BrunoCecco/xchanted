import { forwardRef } from "react";
import Link from "next/link";

const FollowsLink = forwardRef(function FollowsLink(
	{ number, link, text, query },
	ref
) {
	return (
		<Link
			href={{
				pathname: link,
				query: query,
			}}
			passHref
		>
			<div className="cursor-pointer flex items-center gap-1">
				<span className="font-bold">{number > 0 ? number : 0}</span>
				<span className="text-gray-500 hover:text-primary">{text}</span>
			</div>
		</Link>
	);
});

export default FollowsLink;
