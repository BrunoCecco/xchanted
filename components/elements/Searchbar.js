import { forwardRef } from "react";
import { SearchIcon } from "@heroicons/react/outline";

const Searchbar = forwardRef(function Searchbar(
	{ id, placeholder, className, size, type, onChange, disabled },
	ref
) {
	return (
		<div className="relative" id={id}>
			<div className="absolute inset-y-0 flex items-center pointer-events-none p-2">
				<SearchIcon className="h-5 w-5 text-gray-500" />
			</div>
			<input
				disabled={disabled}
				className={`bg-gray-50 block w-full pl-8 sm:text-sm rounded-md ring-1 ring-gray-500 focus:outline-none focus:shadow-xl font-poppins disabled:opacity-50 disabled:cursor-not-allowed py-2 ${className}`}
				placeholder={placeholder}
				type={type}
				onChangeCapture={onChange}
				ref={ref}
			/>
		</div>
	);
});

export default Searchbar;
