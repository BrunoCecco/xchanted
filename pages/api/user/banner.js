import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import { setBannerUrl } from "../../../api-lib/db/user";
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { promises as fs } from "fs";
import sharp from "sharp";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

AWS.config.update({
	accessKeyId: "E7839F41BA5AA5AAD444",
	secretAccessKey: "RHHYesqrbX8Nlj2PaWQ8emIBeSUMRv6XhmN3w4Yt",
	//region: "us-east-1",
});
const s3 = new AWS.S3({
	endpoint: "https://s3.filebase.com",
	signatureVersion: "v4",
});

const handler = nc(ncOpts);
handler.use(database, ...auths);

handler.get(async (req, res) => {
	if (!req.user) {
		req.status(401).end();
		return;
	}

	const post = await s3.getSignedUrl("putObject", {
		Bucket: "xchantedbanner",
		Key: `${req.user.username}`, // Only allow one banner per user - prevent spamming
		Expires: 60, // seconds
	});

	const user = await setBannerUrl(
		req.db,
		req.user._id,
		"https://xchantedbanner.s3.filebase.com/" + `${req.user.username}`
	);

	res.status(200).json({ user: user, post: post });
});

export default handler;
