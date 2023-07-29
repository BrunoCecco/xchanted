import { useState, useEffect } from "react";
import NftImage from "./NftImage";
import Username from "../elements/Username";
import Link from "next/link";

export default function Suggested({ suggestedNfts, metadata, nft, open }) {
	return (
		<div className="w-full text-center">
			<div className="text-2xl font-bold md:my-12 my-6">
				Suggested based on {metadata.name || nft?.name}
			</div>
			<div className="w-full overflow-auto cursor-pointer md:my-12 my-6">
				<div className="h-full w-fit flex md:gap-x-12 gap-x-6 items-center md:m-12 m-6">
					{suggestedNfts &&
						suggestedNfts.map((item, index) => (
							<div
								className="w-full h-full flex flex-col items-center justify-center gap-6"
								key={"suggested" + index}
							>
								<div className="line-clamp-2 h-12">
									{item.data?.name || item.name || "Unknown"}
								</div>
								<NftImage
									metadata={
										item.data?.metadata
											? item.data.metadata
											: item.metadata
									}
									classname={
										"rounded-2xl shadow-xl hover:-translate-y-4 cursor-pointer bg-cover bg-center h-[25vw] w-[25vw] transition duration-200 ease-in-out"
									}
									click={() => open(item)}
								/>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
