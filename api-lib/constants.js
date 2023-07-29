export const ValidateProps = {
	user: {
		username: { type: "string", minLength: 1 },
		name: { type: "string", minLength: 0, maxLength: 50 },
		password: { type: "string", minLength: 8 },
		email: { type: "string", minLength: 1 },
		createdAt: { type: "string" },
		bio: { type: "string", minLength: 0, maxLength: 160 },
		website: { type: "string", minLength: 0, maxLength: 100 },
		picture: { type: "string" },
		tagged: { type: "string", minLength: 0 },
	},
	post: {
		content: { type: "string", minLength: 1, maxLength: 280 },
	},
	comment: {
		content: { type: "string", minLength: 1, maxLength: 280 },
	},
};
