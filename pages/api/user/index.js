import nc from "next-connect";
import multer from "multer";
import { ValidateProps } from "../../../api-lib/constants";
import { ncOpts } from "../../../api-lib/nc";
import { slugUsername } from "../../../lib/user";
import {
	findUserByEmail,
	findUserByUsername,
	updateUserById,
	setBannerUrl,
	findUserById,
} from "../../../api-lib/db/user";
import { filterThroughNfts } from "../../../utils/compareUserData";
import { auths, database, validateBody } from "../../../api-lib/middlewares";
import { promises as fs } from "fs";
import sharp from "sharp";
import isEmail from "validator/lib/isEmail";
import normalizeEmail from "validator/lib/normalizeEmail";
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

//const client = create("http://159.65.29.127:5001");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./tmp");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });
const handler = nc(ncOpts);
handler.use(database, ...auths);

//get user info
handler.get(async (req, res) => {
	if (!req.user) return res.json({ user: null });
	return res.json({ user: req.user });
});

//update user info
handler.patch(
	upload.single("profilePicture"),
	validateBody({
		type: "object",
		properties: {
			username: ValidateProps.user.username,
			usernameNFT: { type: "string", minLength: 0 },
			name: ValidateProps.user.name,
			email: ValidateProps.user.email,
			bio: ValidateProps.user.bio,
			website: ValidateProps.user.website,
			banner: ValidateProps.user.picture,
			bannerNFT: ValidateProps.user.picture,
			profilePicture: ValidateProps.user.picture,
			tagged: ValidateProps.user.tagged,
			bannerDescription: { type: "string", minLength: 0, maxLength: 300 },
			bannerTitle: { type: "string", minLength: 0, maxLength: 30 },
			hiddenCollections: { type: "string", minLength: 0 },
			collectionsOrder: { type: "string" },
		},
		additionalProperties: false,
	}),
	async (req, res) => {
		if (!req.user) {
			req.status(401).end();
			return;
		}
		var usernameNFT = req.body.usernameNFT
			? JSON.parse(req.body.usernameNFT)
			: null;
		const name = req.body.name;
		const email = req.body.email;
		const bio = req.body.bio;
		const website = req.body.website;
		const banner = req.body.banner;
		const bannerNFT = req.body.bannerNFT
			? JSON.parse(req.body.bannerNFT)
			: null;
		var profilePicture = req.body.profilePicture
			? JSON.parse(req.body.profilePicture)
			: null;
		const tagged = req.body.tagged ? JSON.parse(req.body.tagged) : null;
		const bannerDescription = req.body.bannerDescription;
		const bannerTitle = req.body.bannerTitle;
		const hiddenCollections = req.body.hiddenCollections
			? JSON.parse(req.body.hiddenCollections)
			: null;
		const collectionsOrder = req.body.collectionsOrder
			? JSON.parse(req.body.collectionsOrder)
			: null;

		console.log(JSON.stringify(req.body));

		let username;

		if (req.body.username) {
			username = slugUsername(
				req.body.username
					.toString()
					.replace(".eth", "")
					.replace(".sol", "")
			);
			if (
				username !== req.user.username &&
				(await findUserByUsername(req.db, username))
			) {
				res.status(403).json({
					error: { message: "The username has already been taken." },
				});
				return;
			}
		}

		if (profilePicture || usernameNFT) {
			const u = await findUserById(req.db, req.user._id);

			if (
				usernameNFT &&
				usernameNFT.name.includes(".eth") &&
				!filterThroughNfts(usernameNFT._id, u.nfts)
			) {
				usernameNFT = {};
			}

			if (
				profilePicture &&
				!filterThroughNfts(profilePicture._id, u.nfts)
			) {
				profilePicture = {};
			}
		}

		// validate email

		if (email && !isEmail(email)) {
			res.status(400).json({
				error: { message: "The email you entered is invalid." },
			});
			return;
		}
		if (email && req.user.email != email) {
			if (await findUserByEmail(req.db, email)) {
				res.status(403).json({
					error: { message: "The email has already been used." },
				});
				return;
			}
		} else if (email) {
			// email was the same, no need to update
			return;
		}

		const user = await updateUserById(req.db, req.user._id, {
			...(username && { username: username }),
			...(usernameNFT && { usernameNFT: usernameNFT }),
			...(name && { name: name }),
			...(email && { email: email }),
			...(typeof bio === "string" && { bio: bio }),
			...(website && { website: website }),
			...(banner && { banner: banner }),
			...(bannerNFT && { bannerNFT: bannerNFT }),
			...(profilePicture && { profilePicture: profilePicture }),
			...(tagged && { tagged: tagged }),
			...(bannerDescription && { bannerDescription: bannerDescription }),
			...(bannerTitle && { bannerTitle: bannerTitle }),
			...(hiddenCollections && { hiddenCollections: hiddenCollections }),
			...(collectionsOrder && { collectionsOrder: collectionsOrder }),
		});

		res.json({ user });
	}
);

handler.post(upload.single("banner"), async (req, res) => {
	if (!req.user) {
		req.status(401).end();
		return;
	}
	if (req.file.mimetype && !req.file.mimetype.startsWith("image/")) {
		console.log("File is not an image!");
		res.status(403).json({ error: { message: "Invalid file" } });
		return;
	}
	if (req.file) {
		console.log(req.file);
		const data = await fs.readFile(req.file.path);
		const s = sharp(data, {
			animated: true,
		});
		const imgMetadata = await s.metadata();
		let output = null;
		let format = "jpeg";

		if (req.file.mimetype.startsWith("image/gif")) {
			output = await s
				.toFormat("gif", {
					effort: 1,
					loop: 0,
				})
				.toBuffer();
			format = "gif";
		} else {
			output = await s.resize({
				width: 1440,
			});
			output = await output
				.toFormat("jpeg", { mozjpeg: true }) // use non-lossy JPEG compression, JPEGs > PNGs when it comes to size
				.toBuffer();
		}
		console.log(`Image Size Ratio: ${output.byteLength / data.byteLength}`);
		const name = "banner" + uuidv4();
		try {
			var params = {
				Bucket: "xchantedbanner",
				Key: name,
				//ContentEncoding: "base64",
				ContentType: "image/" + format,
				Body: output,
			};

			const putreq = await s3.putObject(params).promise();

			const user = await setBannerUrl(
				req.db,
				req.user._id,
				"https://xchantedbanner.s3.filebase.com/" + name
			);

			const remove = await fs.unlink(req.file.path);

			res.status(200).json({ user });
		} catch (e) {
			console.log(e);
			res.status(403).send("upload failed");
		}
	}
});

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler;
