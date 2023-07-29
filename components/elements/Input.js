import { forwardRef } from "react";

const Input = forwardRef(function Input(
	{
		id,
		label,
		placeholder,
		className,
		name,
		type,
		autoComplete,
		size,
		ariaLabel,
		hidden,
		value,
		required,
		onChange,
		onBlur,
		onFocus,
		disabled,
	},
	ref
) {
	return (
		<div className="w-full">
			{label != null ? (
				<label className="block uppercase text-gray-700 text-xs font-bold mb-2">
					{label}
				</label>
			) : null}
			<input
				id={id}
				disabled={disabled}
				hidden={hidden}
				type={type}
				autoComplete={autoComplete}
				placeholder={placeholder}
				ref={ref}
				value={value}
				className={`block w-full bg-white text-gray-700 border border-gray-300 rounded-xl h-12 px-4 leading-tight focus:outline-none focus:ring-0 ring-0 text-${size} ${className}`}
				aria-label={ariaLabel}
				required={required}
				onChange={onChange}
				onBlur={onBlur}
				onFocus={onFocus}
				name={name}
			/>
		</div>
	);
});

export default Input;
