import XChQRCode from "./XChQRCode";
import ColourCircle from "./ColourCircle";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import Icon from "../elements/Icon";
import { FiDownload } from "react-icons/fi";

export default function QRCode({ data }) {
	const qrDownload = useRef(null);

	const [selectedPP, setSelectedPP] = useState(
		data?.user?.profilePicture?.data?.metadata
	);
	const [colour, setColour] = useState("#fff");
	const [gradientCols, setGradientCols] = useState(["#FF2079", "#473BE8"]);
	const [colourDict, setColourDict] = useState({
		"#000": [
			["#fff", "#fff"],
			["#FF1493", "#FFFF02"],
			["#39FF14", "#39FF14"],
			["#DEB3AD", "#F51663"],
			["#BDE5EC", "#14ECB2"],
			["#BDE5EC", "#5BD3EF"],
			["#4DA5E7", "#1A82C4"],
			["#E421BC", "#E421BC"],
			["#E421BC", "#5BD3EF", "#2204DA"],
		],
		"#fff": [
			["#FF2079", "#473BE8"],
			["#552586", "#473BE8"],
			["#043927", "#50C878"],
			["#6909D5", "#E421BC"],
			["#630EAC", "#980AD7"],
			["#E421BC", "#E421BC"],
			["#E421BC", "#5BD3EF", "#2204DA"],
			["#14ECB2", "#E421BC", "#980AD7"],
			["#000", "#000"],
		],
		"#473BE8": [
			["#39FF14", "#39FF14"],
			["#FF1493", "#FFFF02"],
			["#fff", "#fff"],
			["#E421BC", "#E421BC"],
			["#DEB3AD", "#F51663"],
			["#000", "#000"],
			["#FF2079", "#FF2079"],
			["#FFFF02", "#FFFF02"],
			["#14ECB2", "#FFFF02"],
		],
	});

	useEffect(() => {
		setSelectedPP(data.user.profilePicture?.data?.metadata);
	}, [data?.user?.profilePicture]);

	const exportAsImage = async (el) => {
		const canvas = await html2canvas(el, {
			allowTaint: true,
			useCORS: true,
			// foreignObjectRendering: true,
		});
		const image = canvas.toDataURL("image/png");
		downloadImage(image, "XChantedQR");
	};

	const downloadImage = (blob, fileName) => {
		const fakeLink = window.document.createElement("a");
		fakeLink.style = "display:none;";
		fakeLink.download = fileName;
		fakeLink.href = blob;
		document.body.appendChild(fakeLink);
		fakeLink.click();
		document.body.removeChild(fakeLink);
		fakeLink.remove();
	};

	return (
		<div className="overflow-hidden flex flex-wrap justify-center items-center bg-grey w-full h-fit rounded-2xl relative p-8">
			{/* <section className="flex flex-col w-full h-full items-center justify-center">
			<div className="overflow-hidden flex md:flex-nowrap flex-wrap justify-center gap-6 transition-all duration-500 ease-in-out bg-grey w-full p-12 pb-20 rounded-2xl relative"> */}
			<div className="items-center basis-1/2">
				<div className="flex flex-col gap-6 items-start justify-center">
					<div>BACKGROUND</div>
					<div
						className="grid items-center gap-2"
						style={{ gridTemplateColumns: "auto auto auto" }}
					>
						{Object.keys(colourDict).map((col, i) => {
							return (
								<ColourCircle
									key={i}
									colour={col}
									onClick={() => {
										setColour(col);
										setGradientCols(colourDict[col][0]);
									}}
									selected={col === colour}
								/>
							);
						})}
					</div>
					<div>QR GRADIENT</div>
					<div
						className="grid items-center gap-2"
						style={{
							gridTemplateColumns: "auto auto auto auto auto",
						}}
					>
						{colourDict[colour].map((gradient, i) => {
							return (
								<ColourCircle
									key={i}
									colour={
										gradient[2]
											? `linear-gradient(to right, ${gradient[0]}, ${gradient[1]}, ${gradient[2]})`
											: gradient[1] != gradient[0]
											? `linear-gradient(to right, ${gradient[0]}, ${gradient[1]})`
											: gradient[0]
									}
									onClick={() =>
										setGradientCols([
											gradient[0],
											gradient[1],
										])
									}
									selected={
										gradientCols[0] === gradient[0] &&
										gradientCols[1] === gradient[1]
									}
								/>
							);
						})}
					</div>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center basis-1/2 gap-4">
				<div
					ref={qrDownload}
					className="relative flex items-center justify-center"
				>
					<XChQRCode
						userURL={`https://xchanted.com/@${data?.user.username}`}
						backgroundCol={colour}
						gradientCols={[gradientCols[0], gradientCols[1]]}
						profilePic={selectedPP}
					></XChQRCode>
				</div>
				<Icon
					onClick={() => exportAsImage(qrDownload.current)}
					className="absolute right-4 bottom-4 bg-primary text-white rounded-full p-2"
					icon={<FiDownload />}
				/>
			</div>
		</div>
		// </section>
	);
}
