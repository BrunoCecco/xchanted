const plugin = require("tailwindcss/plugin");

module.exports = {
	mode: "jit",
	darkMode: "class",
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./node_modules/flowbite/**/*.js",
	],
	safelist: ["border-red-500"],
	variants: {
		extend: {
			filter: ["hover", "focus"],
			display: ["group-hover"],
		},
	},
	theme: {
		fontSize: {
			xxs: ".5rem",
			xs: ".75rem",
			sm: ".875rem",
			tiny: ".875rem",
			base: "1rem",
			lg: "1.125rem",
			xl: "1.25rem",
			"2xl": "1.5rem",
			"3xl": "1.875rem",
			"4xl": "2.25rem",
			"5xl": "3rem",
			"6xl": "4rem",
			"7xl": "5rem",
		},
		fontFamily: {
			poppins: ["Poppins", "sans-serif"],
		},
		extend: {
			colors: {
				primary: "var(--primary)",
				secondary: "var(--secondary)",
				"bkg-1": "var(--bkg-1)",
				"bkg-2": "var(--bkg-2)",
				"bkg-3": "var(--bkg-3)",
				"txt-1": "var(--txt-1)",
				"txt-2": "var(--txt-2)",
				"txt-3": "var(--txt-3)",
				"txt-4": "var(--txt-4)",
				grey: "#F4F5F6",
				black: "#353945",
				orange: "#FF9F1C",
				hover: "#7a7ad1",
				text: "#ffffff",
			},
		},
	},
	plugins: [
		require("flowbite/plugin"),
		require("tailwind-scrollbar-hide"),
		require("@tailwindcss/line-clamp"),
		plugin(function ({ addUtilities }) {
			addUtilities({
				".scrollbar-hide": {
					/* IE and Edge */
					"-ms-overflow-style": "none",

					/* Firefox */
					"scrollbar-width": "none",

					/* Safari and Chrome */
					"&::-webkit-scrollbar": {
						display: "none",
					},
				},
			});
		}),
	],
};
