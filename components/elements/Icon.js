import { forwardRef, useState, useEffect } from "react";
import Image from "next/image";

const Icon = forwardRef(function Icon(
	{ id, size, className, onClick, icon, src, disabled, colour, style },
	ref
) {
	return src != null ? (
		<button
			id={id}
			ref={ref}
			className={`rounded-full disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center w-8 h-8 object-contain cursor-pointer hover:scale-110 transition transform duration-200 ease-out overflow-hidden ${
				size == "sm" && `h-4 w-4`
			} ${className}`}
			onClick={onClick}
			disabled={disabled}
			style={style}
		>
			<Image
				src={src}
				alt=""
				width={20}
				height={20}
				objectFit="contain"
			/>
		</button>
	) : (
		<button
			id={id}
			ref={ref}
			className={`cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed hover:scale-110 transition transform duration-200 ease-out overflow-hidden text-${colour} 
      ${size ? `text-${size}` : `text-2xl`} ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			{icon}
		</button>
	);
});

export default Icon;
