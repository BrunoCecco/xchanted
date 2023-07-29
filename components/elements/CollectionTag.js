import { forwardRef } from "react";
import CollectionIcon from "./CollectionIcon";
import { IoIosCheckmark } from "react-icons/io";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";

const CollectionTag = forwardRef(function CollectionTag(
	{
		col,
		clickEye,
		select,
		clickCollection,
		selected,
		sorting,
		hidden = false,
	},
	ref
) {
	return (
		<div
			key={col?._id}
			className={`my-1 relative text-white text-gray-300 hover:!text-black flex justify-start gap-2 items-center w-full hover:bg-white px-6 cursor-pointer ${
				sorting == true && `shadow-xl`
			}`}
			style={{ opacity: hidden && 0.5 }}
			onClick={() => select(col?._id)}
		>
			<div className="basis-2/12">
				<div
					className="h-10 w-10 rounded-lg overflow-hidden bg-center bg-cover"
					style={{
						backgroundImage: `url(${col?.image_url})`,
					}}
				/>
			</div>
			<div className="text-black px text-left font-bold line-clamp-1 break-all basis-7/12">
				<div className="w-full">
					{col?.name?.includes("Unidentified")
						? allNfts.find((el) => el._id.includes(col?._id))
								.metadata.name
						: col?.name}
				</div>
			</div>
			{!hidden && (
				<div
					className="text-white cursor-pointer basis-2/12"
					onClick={() => clickCollection(col?._id)}
				>
					{selected.includes(col?._id) ? (
						<IoIosCheckmark
							size={64}
							className="bg-primary h-8 w-8 rounded-full hover:opacity-50"
						/>
					) : (
						<IoIosCheckmark
							size={64}
							className="bg-white h-8 w-8 rounded-full text-gray-500 hover:bg-primary hover:text-white"
						/>
					)}
				</div>
			)}
			<div
				className="absolute right-2 hover:opacity-50 cursor-pointer basis-1/12"
				onClick={() => clickEye(col)}
			>
				{hidden ? <AiFillEye /> : <AiFillEyeInvisible />}
			</div>
		</div>
	);
});

export default CollectionTag;
