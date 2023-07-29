import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
	{
		label,
		placeholder,
		className,
		htmlType,
		autoComplete,
		size,
		ariaLabel,
		required,
		rows,
		maxLength,
		onChange,
		onBlur,
	},
	ref
) {
	return (
		<div className="w-full">
			<label className="block uppercase text-gray-700 text-xs font-bold mb-2">
				{label}
			</label>
			<textarea
				className="whitespace-pre-wrap shadow appearance-none border border-gray-300 rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-gray-500 focus:ring-0 ring-0"
				rows={rows}
				placeholder={placeholder}
				ref={ref}
				aria-label={ariaLabel}
				maxLength={maxLength}
				onChange={onChange}
				onBlur={onBlur}
			></textarea>
		</div>
	);
});

export default Textarea;
