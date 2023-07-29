import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import logo from "../../public/logo.svg";
import logoWhite from "../../public/logoWhite.svg";

export default function XChQRCode({
	userURL,
	backgroundCol,
	gradientCols,
	profilePic,
}) {
	const [url, setUrl] = useState(userURL);
	const ref = useRef(null);
	let qrCode = null;

	const extension = (svg, options) => {
		const { width, height } = options;
		const size = Math.min(width, height);
		const border = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"rect"
		);
		const borderAttributes = {
			fill: "none",
			x: (width - size + 40) / 2,
			y: (height - size + 40) / 2,
			width: size - 40,
			height: size - 40,
			stroke: "black",
			"stroke-width": 40,
			rx: 50,
		};
		Object.keys(borderAttributes).forEach((attribute) => {
			border.setAttribute(attribute, borderAttributes[attribute]);
		});
		svg.appendChild(border);
	};

	useEffect(() => {
		qrCode = null;
		const QRCodeStyling = require("qr-code-styling");
		qrCode = new QRCodeStyling({
			errorCorrectionLevel: "H",
			width: 300,
			height: 300,
			type: "svg",
			image: profilePic?.imgopti ?? profilePic?.image ?? null,
			margin: 2,
			dotsOptions: {
				gradient: {
					type: "linear",
					colorStops: [
						{ offset: 0, color: gradientCols[0] },
						{ offset: 1, color: gradientCols[1] },
					],
				},
				type: "rounded",
			},
			backgroundOptions: {
				color: backgroundCol,
			},
			cornersSquareOptions: {
				type: "extra-rounded",
			},
			imageOptions: {
				crossOrigin: "anonymous",
				margin: 10,
				imageSize: 0.7,
			},
		});
		qrCode.append(ref.current);
		qrCode.applyExtension(extension);
		qrCode.deleteExtension();
		qrCode.update({
			data: url,
		});
	});

	useEffect(() => {
		if (qrCode) {
			const options = qrCode._options;
			options.backgroundOptions.color = backgroundCol;
		}
	}, [backgroundCol]);

	const downloadQR = () => {
		qrCode.download({ name: "XchantedQR", extension: "svg" });
	};

	return (
		<div className="flex flex-col items-center justify-center p-6 bg-grey">
			<div
				ref={ref}
				className="rounded-t-2xl overflow-hidden cursor-pointer"
				onClick={downloadQR}
			/>
			<div
				className="w-[300px] text-center pt-2 pb-6 relative rounded-b-2xl shadow-2xl"
				style={{ backgroundColor: `${backgroundCol}` }}
			>
				{/* <div
					className="absolute -z-50 mx-auto left-0 right-0 h-[104px] w-[104px] translate-y-[-210px] bg-cover bg-center bg-white"
					// style={{
					// 	backgroundImage: `url(${profilePic?.image})`,
					// }}
				>
				</div> */}
				<div
					style={{
						backgroundImage: `url(${
							backgroundCol.includes("#fff")
								? logo.src
								: logoWhite.src
						})`,
						filter:
							backgroundCol.includes("#fdfvff") &&
							"invert(35%) sepia(78%) saturate(6600%) hue-rotate(240deg) brightness(89%) contrast(106%)",
					}}
					className="w-[300px] h-[40px] bg-contain bg-center bg-no-repeat"
				/>
			</div>
		</div>
	);
}
