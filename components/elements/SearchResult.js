import { forwardRef, useEffect } from "react";
import Image from "next/image";
import MessageBtn from "./MessageBtn";
import { MdVerified } from "react-icons/md";

const SearchResult = forwardRef(function SearchResult(
	{
		id,
		onClick,
		image,
		text,
		chainImg,
		title = false,
		includeMsgButton = false,
		verified,
	},
	ref
) {
	return title ? (
		<div className="font-bold p-2 border-b border-gray-300 uppercase text-gray-500 text-xs font-poppins">
			{text}
		</div>
	) : (
		<div
			className="relative w-full cursor-pointer hover:shadow-lg border-b border-gray-300 flex items-center justify-between gap-2 text-sm p-2 font-poppins text-black"
			onClick={onClick}
		>
			<div className="flex items-center gap-2 text-black w-full">
				<div className="basis-1/6">
					<div className="w-8 h-8 relative objectFit rounded-lg overflow-hidden">
						{image}
					</div>
				</div>
				<div className="line-clamp-1 break-words">{text}</div>
			</div>
			<div className="flex items-center gap-2 text-black">
				<div>
					{verified ? (
						<MdVerified size={24} className="text-primary" />
					) : (
						""
					)}
				</div>
				<div className="w-8 h-8 flex items-center justify-center relative right-2 rounded-lg overflow-hidden">
					{includeMsgButton && <MessageBtn userid={id} />}
					{chainImg && (
						<div className="h-4 w-4 objectFit relative">
							<Image
								layout="fill"
								objectFit="contain"
								src={chainImg.src}
								alt=""
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

export default SearchResult;
