import { forwardRef } from "react";

const Button = forwardRef(function Button(
	{
		id,
		className,
		size,
		type,
		onClick,
		text,
		disabled,
		colour = "primary",
		filled = true,
		icon,
	},
	ref
) {
	return (
		<button
			id={id}
			type={type}
			ref={ref}
			className={`flex relative uppercase items-center justify-center rounded-full
			px-4 py-2 hover:opacity-50 transition duration-200 ease-in-out text-${size} ${
				size == "xs" && "h-8"
			} ${size == "sm" && "h-10"} ${size == "md" && "h-12"} ${
				size == "lg" && "h-14"
			} ${filled ? "text-white" : `text-${colour}`} ${
				colour && filled && `bg-${colour}`
			} border-${colour} border-2 ${className}`}
			onClick={onClick}
		>
			{text}
			<div className="absolute right-2">{icon}</div>
		</button>
	);
});

export default Button;
