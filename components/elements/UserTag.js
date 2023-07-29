import ProfilePicture from "./ProfilePicture";
import Username from "./Username";
import Button from "./Button";
import Link from "next/link";
import { useCurrentUser } from "../../lib/user";

export default function UserTag({ user, isFollowing }) {
	const { data, error, mutate } = useCurrentUser();

	return (
		<Link href={`/@${user.username}`}>
			<a>
				<div className="rounded-2xl cursor-pointer flex justify-start gap-2 items-center border-2 shadow-md hover:shadow-xl p-2">
					<div>
						<div className="w-20 h-20 rounded-2xl">
							<ProfilePicture user={user} />
						</div>
					</div>
					<div className="flex flex-col items-start justify-start w-full">
						<div className="flex justify-between gap-2 w-full items-center text-sm">
							<Username user={user} />
							<div className={`rounded-2xl bg-primary`}>
								{data.user._id != user._id && !isFollowing && (
									<Button
										className="text-xs p-2 text-white"
										text="Follow"
									/>
								)}
							</div>
						</div>
						<div className="line-clamp-2 break-all text-sm text-left text-gray-500 font-extralight">
							{user.bio}
						</div>
					</div>
				</div>
			</a>
		</Link>
	);
}
