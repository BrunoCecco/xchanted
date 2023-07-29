import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetcher } from "../../../lib/fetch";
import UserTag from "../../../components/elements/UserTag";
import CollectionIcon from "../../../components/elements/CollectionIcon";

export default function Follows() {
	const router = useRouter();
	const { collectionId } = router.query;
	const [loading, setLoading] = useState(false);
	const [followers, setFollowers] = useState([]);
	const [collection, setCollection] = useState();

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const res = await fetcher(`/api/collection/getFollowersById`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						collectionId: collectionId,
					}),
				});
				const res2 = await fetcher(`/api/collection/getByIds`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						collectionIds: [collectionId],
					}),
				});
				setFollowers(res.followers);
				setCollection(JSON.parse(res2)[0]);
			} catch (error) {
				console.log("error", error);
			} finally {
				setLoading(false);
			}
		};

		if (collectionId) {
			fetchData();
		}
	}, [collectionId]);

	return (
		<div className="flex flex-col items-center p-6 gap-6">
			<div className="flex items-center gap-2">
				<CollectionIcon collection={collection} size="lg" />
				<div className="font-bold text-xl">
					{collection?.name} Followers
				</div>
			</div>
			<div className="relative flex flex-wrap w-screen justify-around">
				{followers &&
					followers.map((follower) => {
						return (
							<UserTag
								key={follower?._id}
								user={follower}
								isFollowing={true}
							/>
						);
					})}
			</div>
		</div>
	);
}
