import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { fetcher } from "../../lib/fetch";
import Image from "next/image";
import ConfettiExplosion from "react-confetti-explosion";
import Icon from "../elements/Icon";

const styles = {
	notLiked:
		"w-5 h-5 relative hover:filter-none hover:scale-125 transition duration-200 grayscale contrast-[2]",
	liked: "w-5 h-5 relative filter-none hover:filter scale-125 transition duration-200 grayscale contrast-[2]",
};

export default function Appreciate({
	user,
	item,
	type,
	click,
	likesDisplay,
	displayLikes,
}) {
	const [appreciatesNum, setAppreciatesNum] = useState(item.appreciatesNum);
	const [userAppreciated, setUserAppreciated] = useState(
		item.userAppreciated
	);
	const [loading, setLoading] = useState(false);
	const [isConfetti, setIsConfetti] = useState(false);

	const ref = useRef(null);
	const likesNum = useRef(null);

	useEffect(() => {
		setAppreciatesNum(item.appreciatesNum);
		setUserAppreciated(item.userAppreciated);
	}, [item]);

	const updatedb = async () => {
		setIsConfetti(false);
		if (userAppreciated) {
			try {
				fetcher("/api/nft/appreciate", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						nftId: item._id,
						type: type,
					}),
				}).then((res) => {
					if (click) {
						click();
					}
				});
			} catch (e) {
				console.log(e);
				toast.error("Error.");
			}
		} else {
			try {
				fetcher("/api/nft/appreciate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						nftId: item._id,
						type: type,
					}),
				}).then((res) => {
					if (click) {
						click();
					}
				});
			} catch (e) {
				console.log(e);
				toast.error("Error Appreciating.");
			}
		}
	};

	const appreciate = () => {
		setUserAppreciated(!userAppreciated);
		setAppreciatesNum(
			userAppreciated ? appreciatesNum - 1 : appreciatesNum + 1
		);
		setIsConfetti(!userAppreciated);
		setTimeout(updatedb, 500);
	};

	const formatNum = (num) => {
		return Math.abs(num) > 999999
			? Math.sign(num) * (Math.abs(num) / 1000000).toFixed(1) + "m"
			: Math.abs(num) > 999
			? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
			: Math.sign(num) * Math.abs(num);
	};

	return (
		<div className="absolute top-0 right-0 z-100">
			<div
				className={`cursor-pointer absolute top-0 right-0 z-100 flex items-center justify-center gap-1 p-1 rounded-tr-2xl ${
					displayLikes ? `block` : `hidden`
				}`}
				onClick={appreciate}
			>
				<div
					className={userAppreciated ? styles.liked : styles.notLiked}
				>
					<Image
						src={"/hand-clap.svg"}
						alt="appreciate"
						className="h-full w-full"
						layout="fill"
						objectFit="contain"
					/>
				</div>
				<div
					className={`absolute -right-1 -top-2 font-light text-xs text-gray-500`}
				>
					{formatNum(appreciatesNum)}
				</div>
			</div>
			{isConfetti && (
				<div className={`absolute w-16 h-16 mx-auto right-0`}>
					<ConfettiExplosion
						force={0.4}
						floorHeight={500}
						floorWidth={150}
						particleSize={4}
						particleCount={40}
						duration={2000}
						colors={["#473be8"]}
					/>
				</div>
			)}
		</div>
	);
}
