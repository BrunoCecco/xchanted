import { BsArrowsFullscreen } from "react-icons/bs";
import Image from "next/image";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

export default function NftImage({
	metadata,
	classname,
	style,
	click,
	showEverything = false,
	inNftPage = false,
	inModal = false,
	resolution,
}) {
	const [loading, setLoading] = useState(true);
	const imageLoaded = () => {
		setLoading(false);
		console.log("image loaded");
	};

	if (metadata != null) {
		let source = "";

		switch (resolution) {
			case "low":
				source = metadata.imgopti
					? metadata.imgopti
					: metadata.imgopti
					? metadata.imgopti
					: "https://res.cloudinary.com/coin-nft/image/fetch/c_limit,q_eco,w_1000/f_auto/" +
					  metadata.image
					? metadata.animation
					: metadata.animation;
				break;
			case "original":
				source = metadata.animation
					? metadata.animation
					: metadata.image;
				break;
			default:
				source = metadata.imgopti
					? metadata.imgopti
					: metadata.imgopti
					? metadata.imgopti
					: metadata.animation
					? metadata.animation
					: metadata?.image?.indexOf("svg") > -1
					? metadata.image
					: "https://res.cloudinary.com/coin-nft/image/fetch/c_limit,q_auto,w_1440/f_auto/" +
					  metadata.image;
				break;
		}

		const component =
			(metadata.image || metadata.imgopti || metadata.imgopti) &&
			(metadata.type == "v" ||
			metadata?.image?.indexOf("mp4") > -1 ||
			metadata?.image?.indexOf("webm") > -1 ? (
				<video
					className={classname}
					style={{
						objectFit: "cover",
						...style,
					}}
					onClick={click}
					autoPlay
					muted={true}
					loop
					poster={source}
				>
					<source src={source} />
				</video>
			) : !metadata.animation ||
			  (metadata.type && metadata.type == "i") ? (
				!inNftPage ? (
					<div
						onClick={click}
						className={classname}
						style={{
							backgroundImage: `url(${source})`,
							...style,
						}}
					></div>
				) : (
					<div className={classname}>
						<ClipLoader
							loading={loading}
							size={40}
							color={"#fff"}
						/>
						{/* next image styling not ideal for asset page as it can't autosize correctly
						// {source.indexOf("filebase") > -1 ? (
						// 	<Image
						// 		onClick={click}
						// 		src={source}
						// 		alt={metadata.name}
						// 		style={{
						// 			borderRadius: !inModal && "1rem",
						// 			margin: "0 auto",
						// 		}}
						// 		objectFit="cover"
						// 		layout="fill"
						// 	/>
						// ) : ( */}
						<img
							onClick={click}
							src={source}
							alt={metadata.name}
							style={{
								margin: "0 auto",
								objectFit: "cover",
							}}
							className={classname}
							onLoad={imageLoaded}
						/>
					</div>
				)
			) : (metadata.animation.indexOf(".glb") != -1 ||
					metadata.animation.indexOf(".gltf") != -1) &&
			  showEverything ? (
				<model-viewer
					style={{
						boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
						minHeight: "35vw",
						minWidth: "35vw",
						height: "100%",
						width: "100%",
						margin: "auto",
						borderRadius: inModal ? "0px" : "1rem",
						background: "transparent",
						...style,
					}}
					alt={metadata.name}
					poster={metadata.image}
					ar-status="not-presenting"
					src={metadata.animation}
					autoplay="true"
					camera-controls="true"
					auto-rotate="true"
					onClick={click}
				></model-viewer>
			) : showEverything ? (
				<div>
					<iframe
						className={classname}
						src={metadata.animation}
						style={{ borderRadius: inModal && "0px", ...style }}
						loading="eager"
						allow="autoplay"
						allowFullScreen={true}
					></iframe>
					{!inModal && inNftPage && (
						<div
							className="cursor-pointer absolute bg-white text-primary rounded-md p-2 top-3 left-3"
							onClick={click}
						>
							<BsArrowsFullscreen />
						</div>
					)}
				</div>
			) : (
				<div
					onClick={click}
					className={classname}
					style={{
						backgroundImage: `url(${
							metadata.imgopti
								? metadata.imgopti
								: metadata.imgopti
								? metadata.imgopti
								: metadata.image
						})`,
						...style,
					}}
				></div>
			));
		return (
			component || (
				<div
					className="rounded-2xl border-2 h-full w-full"
					onClick={click}
				></div>
			)
		); // TODO: Handle the case where media type is not supported
	} else
		return (
			<div
				className="rounded-2xl border-2 h-full w-full"
				onClick={click}
			></div>
		);
}
