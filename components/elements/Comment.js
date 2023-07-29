import { forwardRef } from "react";
import Appreciate from "../nft/appreciate";
import { IoIosClose } from "react-icons/io";
import Username from "../elements/Username";
import ProfilePicture from "../elements/ProfilePicture";
import Icon from "../elements/Icon";

const Comment = forwardRef(function Comment(
	{ comment, currentUser, ownerComment = false, deleteComment },
	ref
) {
	return (
		<div
			className={`w-full h-auto relative flex items-center justify-start gap-1 md:gap-4 bg-grey p-3 rounded-3xl group ${
				ownerComment && `border-2 border-primary`
			}`}
		>
			<div>
				<div className="h-20 w-20">
					<ProfilePicture user={comment.user} />
				</div>
			</div>
			<div className="flex flex-col gap-1 text-xs md:text-sm">
				<Username user={comment.user} />
				<div className="line-clamp-2 hover:line-clamp-none break-all">
					{comment.text}
				</div>
			</div>
			{currentUser == comment.user._id && (
				<div
					className="absolute -bottom-4 right-0 text-red-500 text-xs hidden group-hover:block cursor-pointer hover:opacity-75"
					onClick={() => deleteComment(comment._id)}
				>
					Delete comment
				</div>
			)}
			<Appreciate item={comment} displayLikes={true} type={"comments"} />
		</div>
	);
});

export default Comment;
