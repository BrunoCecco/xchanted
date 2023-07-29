import { forwardRef } from "react";
import DropDown from "react-dropdown";
import "react-dropdown/style.css";
import { BiUpArrow, BiDownArrow } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";

const Dropdown = forwardRef(function Dropdown(
	{ options, onChange, value, size },
	ref
) {
	return (
		<DropDown
			className="!w-auto !text-sm"
			controlClassName={`!rounded-full flex items-center justify-around gap-2 !px-4 !py-2 !bg-primary !text-white !cursor-pointer hover:opacity-75 text-${size}`}
			menuClassName="!rounded-2xl !border-primary !min-w-full !w-max"
			arrowClosed={<BiDownArrow />}
			arrowOpen={<BiUpArrow />}
			options={options}
			onChange={onChange}
			value={value}
		/>
	);
});

export default Dropdown;
