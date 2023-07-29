const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: false,
});

const securityHeaders = [
	{
		key: "X-XSS-Protection",
		value: "1; mode=block",
	},
	{
		key: "X-Frame-Options",
		value: "SAMEORIGIN",
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "X-DNS-Prefetch-Control",
		value: "on",
	},
	{
		key: "Referrer-Policy",
		value: "origin-when-cross-origin",
	},
];

module.exports = withBundleAnalyzer({
	images: {
		domains: [
			"astyanax.io",
			"cf-ipfs.com",
			"infura-ipfs.io",
			"www.arweave.net",
			"arweave.net",
			"i.imgur.com",
			"storage.googleapis.com",
			"lh1.googleusercontent.com",
			"lh2.googleusercontent.com",
			"lh3.googleusercontent.com",
			"lh4.googleusercontent.com",
			"lh5.googleusercontent.com",
			"lh6.googleusercontent.com",
			"cloudflare-ipfs.com",
			"renga.imgix.net",
			"img.seadn.io",
			"data.solanart.io",
			"openseauserdata.io",
			"bafybeigxjvjpaijds7g6y4kprvqz764okzuqoo26xsx67bj7d4nd5whiam.ipfs.dweb.link",
			"bafybeidroepu244ficol2xohhvkdmcullopis4xhk4myoieolyf3bfzwle.ipfs.nftstorage.link",
			"bafybeigcznmv2vdyisftaxpohpmouve5nklntrm7ibe4qg2cy45cnmkv54.ipfs.nftstorage.link",
			"assets.poap.xyz",
			"xchanted.s3.filebase.com",
			"img-ae.seadn.io",
			"openseauserdata.com",
		],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
	webpack: (config, options) => {
		config.experiments = {
			topLevelAwait: true,
			layers: true,
		};
		return config;
	},
});
