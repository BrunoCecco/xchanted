import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Notifications from "../../components/layout/notifications";
import { fetcher } from "../../lib/fetch";
import UserTag from "../../components/elements/UserTag";

const Column = ({ title, items }) => {
	return (
		<div className="md:col-span-1 flex flex-col pb-8 h-auto scrollbar-hide overflow-y-auto overflow-x-hidden">
			<h1 className="m-5">{title}</h1>
			<div className="flex flex-col gap-6 mx-auto">
				{items.length > 0 &&
					items.map((user, index) => (
						<UserTag
							key={user._id}
							user={user}
							isFollowing={
								title == "Followers"
									? user.requesterFollowingThisUser
									: true
							}
						/>
					))}
			</div>
		</div>
	);
};

export default function Follows() {
	const router = useRouter();
	const { choice } = router.query;
	const { username } = router.query;
	const [userPress, setUserPress] = useState(choice);
	const [loading, setLoading] = useState(false);

	const [followers, setFollowers] = useState([]);
	const [following, setFollowing] = useState([]);

	function changeGrayCover(val) {
		console.log("Changing to ", val);
		setUserPress(val);
	}

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const res = await fetcher(`/api/user/${username}/follow`, {
					method: "GET",
				});
				setFollowers(res.followers);
				setFollowing(res.following);
			} catch (error) {
				console.log("error", error);
			} finally {
				setLoading(false);
			}
		};

		if (username) {
			fetchData();
		}
	}, [username]);

	return (
		<div className="relative md:grid md:grid-cols-2 w-screen text-center">
			<div
				className={`${
					userPress == "following"
						? "md:absolute z-50 md:top-0 md:left-0 border-gray-800 border-r-4 bg-gray-800 bg-opacity-80 col-start-1 h-[100vh] w-full md:w-1/2"
						: "hidden"
				}`}
				onClick={() => {
					changeGrayCover("follows");
				}}
			></div>
			<Column title="Following" items={following} />
			<div
				className={`${
					userPress == "follows"
						? "border-l-4 z-50 border-gray-800 absolute top-0 left-0 bg-gray-800 bg-opacity-80 col-start-2 h-[100vh] w-full"
						: "hidden"
				}`}
				onClick={() => {
					changeGrayCover("following");
				}}
			></div>
			<Column title="Followers" items={followers} />
		</div>
	);
}
