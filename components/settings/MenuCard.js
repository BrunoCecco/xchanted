import { useEffect, useState } from "react";
import NftImage from "../nft/NftImage";
import ProfilePicture from "../elements/ProfilePicture";

// menu card with user profile pic and menu tabs
export default function MenuCard({ user, tabs, onClick }) {
	return (
		<div className="rounded-2xl bg-white shadow-2xl p-8 flex flex-col gap-8 items-center justify-center max-w-[250px] md:min-w-[22vw] md:w-[20vw] md:max-w-[100px] mx-auto">
			<div className="h-32 w-32">
				<ProfilePicture
					user={user}
					// metadata={user.profilePicture?.data?.metadata}
					// classname={
					// 	"rounded-2xl w-full h-full overflow-hidden bg-center bg-cover"
					// }
				/>
			</div>
			<div className="flex flex-col items-center justify-center gap-4 w-full">
				{tabs &&
					tabs.map((tab, index) => (
						<div
							className={`cursor-pointer p-2 w-full rounded-lg text-left text-sm font-semibold ${
								!tab.disabled &&
								`hover:text-black hover:bg-gray-200`
							} transition duration-200 ease-in-out ${
								tab.isActive
									? `bg-gray-200 text-black`
									: `bg-white text-gray-500`
							} ${tab.disabled && `coming-soon`}`}
							key={"tab" + index}
							onClick={() =>
								tab.disabled ? null : onClick(index)
							}
						>
							{tab.name}
						</div>
					))}
				<hr className="w-full bg-gray-500" />
				<div className="text-xs text-gray-500">
					{user.createdAt &&
						"Member Since " +
							new Date(user.createdAt).toLocaleDateString()}
				</div>
			</div>
		</div>
	);
}
