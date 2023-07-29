import nodemailer from "nodemailer";

const nodemailerConfig = process.env.NODEMAILER_CONFIG;
const config = nodemailerConfig ? JSON.parse(nodemailerConfig) : {};

const transporter = nodemailer.createTransport(config);

export async function sendMail({ from, to, subject, html }) {
	try {
		await transporter.sendMail({
			from,
			to,
			subject,
			html,
		});
	} catch (e) {
		console.error(e);
		throw new Error(`Could not send email: ${e.message}`);
	}
}

export const CONFIG = {
	// TODO: Replace with the email you want to use to send email
	from: "team@xchanted.com",
};
