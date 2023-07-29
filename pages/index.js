import LogoWhite from "../public/logoWhite.svg";
import Image from "next/image";
import LogoTransparent from "../public/BigLogoTransparent.svg";
import Link from "next/link";
import Button from "../components/elements/Button";
import Username from "../components/elements/Username";
import ProfilePicture from "../components/elements/ProfilePicture";
import grid1 from "../public/grid1.png";
import grid2 from "../public/grid2.png";
import trendingImg from "../public/trending1.png";
import walletsImg from "../public/wallets.jpeg";
import QRCodeImg from "../public/XchantedQR.svg";
import { useEffect, useState } from "react";
import { fetcher } from "../lib/fetch";
import { useRouter } from "next/router";
import ClipLoader from "react-spinners/ClipLoader";

const Socials = () => {
	return (
		<div className="flex flex-col gap-4">
			<div className="socials flex flex-col gap-4">
				<div className="social-links mx-auto">
					<div className="social-link">
						<a
							href="https://www.twitter.com/xchanted_nft"
							target="_blank"
							rel="noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								fill="url(#grad1)"
							>
								{/*<!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->*/}
								<path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
								<defs>
									<linearGradient
										id="grad1"
										x1="0%"
										y1="0%"
										x2="100%"
										y2="0%"
									>
										<stop
											offset="0%"
											stopColor="#6366f1"
											stopOpacity="0.5"
										/>
										<stop
											offset="100%"
											stopColor="#915bf5"
											stopOpacity="1.0"
										/>
									</linearGradient>
								</defs>
							</svg>
						</a>
					</div>
					<div className="social-link">
						<a
							href="https://medium.com/@xchanted/xchanted-the-route-to-web-3-4d564f950b66"
							target="_blank"
							rel="noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 512"
								fill="url(#grad2)"
							>
								{/*<!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->*/}
								<path d="M180.5,74.262C80.813,74.262,0,155.633,0,256S80.819,437.738,180.5,437.738,361,356.373,361,256,280.191,74.262,180.5,74.262Zm288.25,10.646c-49.845,0-90.245,76.619-90.245,171.095s40.406,171.1,90.251,171.1,90.251-76.619,90.251-171.1H559C559,161.5,518.6,84.908,468.752,84.908Zm139.506,17.821c-17.526,0-31.735,68.628-31.735,153.274s14.2,153.274,31.735,153.274S640,340.631,640,256C640,171.351,625.785,102.729,608.258,102.729Z"></path>
								<defs>
									<linearGradient
										id="grad2"
										x1="0%"
										y1="0%"
										x2="100%"
										y2="0%"
									>
										<stop
											offset="0%"
											stopColor="#915bf5"
											stopOpacity="1.0"
										/>
										<stop
											offset="100%"
											stopColor="#c150d5"
											stopOpacity="1.0"
										/>
									</linearGradient>
								</defs>
							</svg>
						</a>
					</div>
					<div className="social-link">
						<a
							href="https://discord.com/invite/n96evZKpjR"
							target="_blank"
							rel="noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 512"
								fill="url(#grad3)"
							>
								{/*<!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->*/}
								<path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
								<defs>
									<linearGradient
										id="grad3"
										x1="0%"
										y1="0%"
										x2="100%"
										y2="0%"
									>
										<stop
											offset="0%"
											stopColor="#c150d5"
											stopOpacity="1.0"
										/>
										<stop
											offset="100%"
											stopColor="#ec4899"
											stopOpacity="0.5"
										/>
									</linearGradient>
								</defs>
							</svg>
						</a>
					</div>
				</div>
			</div>
			<div className="w-full h-20 p-4 flex border-t text-xs items-center justify-center">
				&copy; 2022 Xchanted, all rights reserved
			</div>
		</div>
	);
};

const Wave = () => {
	return (
		<div className="wave">
			<svg
				data-name="Layer 1"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1200 120"
				preserveAspectRatio="none"
			>
				<path
					d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
					opacity=".25"
					className="shape-fill"
				></path>
				<path
					d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
					opacity=".5"
					className="shape-fill"
				></path>
				<path
					d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
					className="shape-fill"
				></path>
			</svg>
		</div>
	);
};

const Trending = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(async () => {
		setLoading(true);
		// Load initial data
		/* 		let data = await fetcher(
			`/api/rankings/accounts?type=Followers&limit=3&skip=0&chain=ethereum&sort=-1`
		);
		console.log(data); */
		const data = [
			{
				_id: "6276a015348cbf76ad73eaba",
				username: "manox",
				name: "manox",
				profilePicture: {
					_id: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6309",
					data: {
						metadata: {
							imgopti:
								"https://lh3.googleusercontent.com/j0EOOsJVBbQwblVQ_atWL1hjpAEKmsvCDypBU1cnViEKxqrIU-OZVtfGcKn3YafFGI6bzm5REuaJzNyA1rgSHgnbIxARk6wfmwMSRQ",
							imgoptihigh:
								"https://xchanted.s3.filebase.com/BoredApeYachtClub0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-6309",
						},
						name: "BoredApeYachtClub",
					},
				},
				selectedCollections: [
					{
						_id: "0xed5af388653567af2f388e6224dc7c4b3241c544",
						name: "Azuki",
						slug: "azuki",
						image_url:
							"https://lh3.googleusercontent.com/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT=s64",
					},
					{
						_id: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
						image_url:
							"https://lh3.googleusercontent.com/yIm-M5-BpSDdTEIJRt5D6xphizhIdozXjqSITgK4phWq7MmAU3qE7Nw7POGCiPGyhtJ3ZFP8iJ29TFl-RLcGBWX5qI4-ZcnCPcsY4zI=s64",
						name: "Otherdeed for Otherside",
						slug: "otherdeed",
					},
					{
						_id: "0x0477a628bd5722f56646b094126d4489b121b5ea",
						name: "TIMEPieces Slices of TIME (Slices)",
						slug: "timepieces-sot-slices",
						image_url:
							"https://lh3.googleusercontent.com/e1PRtxH7CXHqDXwzpbmi-aILQ0KpbeOoABm5w4EFdacKo7uy7BTNYa5oEapKWccn4UeK01EuJb2gTgv6VzX0UtnU36MvxMULzMtgcQ=s64",
					},
				],
			},
			{
				_id: "62e2e578b5b83d05dd18a3cd",
				username: "azukispiritdao",
				name: "Spirit Dao",
				profilePicture: {
					_id: "0xed5af388653567af2f388e6224dc7c4b3241c544-3140",
					data: {
						metadata: {
							imgopti:
								"https://lh3.googleusercontent.com/1fAC7aLhX6fNQs40XkY3sz5_aSVwWKg2sKx4pRtUGsiZ32-L1FpDorItCaMD6Nll713FnJ2ulVE9VYTmG971Ekbdtac_TNvQEwelZRg",
						},
						name: "Azuki #3140",
					},
				},
				selectedCollections: [
					{
						_id: "0xed5af388653567af2f388e6224dc7c4b3241c544",
						name: "Azuki",
						slug: "azuki",
						image_url:
							"https://lh3.googleusercontent.com/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT=s64",
					},
				],
			},
			{
				_id: "62e7c0e4c537073c14133c01",
				username: "franklinisbored",
				name: "Franklin is Bored",
				profilePicture: {
					_id: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-1236",
					data: {
						metadata: {
							imgopti:
								"https://lh3.googleusercontent.com/zyycRrhSa38996Lm4Lc6wFfyQU6-8MqmPTnrL0eJ8uh6y0GRkChapBw-GvQuekJmi4vNPuvyCoplERLa30adzWGOkAOTtOZFtk-xQQ",
							imgoptihigh:
								"https://xchanted.s3.filebase.com/BoredApeYachtClub0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-1236",
						},
						name: "BoredApeYachtClub",
					},
				},
				selectedCollections: [
					{
						_id: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
						name: "Bored Ape Yacht Club",
						slug: "boredapeyachtclub",
						image_url:
							"https://lh3.googleusercontent.com/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB=s64",
					},
				],
			},
		];
		setLoading(false);
		setUsers(data);
	}, []);

	const open = (url) => {
		router.replace(url);
	};

	return (
		<div className="flex flex-col gap-2 my-8 py-8 md:w-[50vw] w-full md:px-8 px-4 mx-auto backdrop-blur shadow-md shadow-black z-10 relative">
			<div
				className="text-white cursor-pointer hover:animate-bounce"
				onClick={() => open("/trending")}
			>
				Featured profiles
			</div>
			<ClipLoader loading={loading} color="#fff" size={20} />
			{users.map((user, i) => {
				return (
					<div
						key={i}
						className="hover:scale-105 transition-all duration-200 ease-in shadow-black cursor-pointer rounded-2xl bg-white w-full overflow-hidden"
						onClick={() => open(`/@${user?.username}`)}
					>
						<div className="flex w-full items-center gap-4">
							<div className="md:w-16 md:h-16 w-12 h-12 relative flex items-center justify-center">
								<ProfilePicture user={user} />
							</div>
							<div>
								<Username size="sm" user={user} />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default function Home() {
	function isInViewport(element) {
		const rect = element.getBoundingClientRect();
		const inView =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <=
				(window.innerWidth || document.documentElement.clientWidth);
		return inView;
	}

	useEffect(() => {
		const fadeElements = document.getElementsByClassName("fade-in");
		for (var i = 0; i < fadeElements.length; i++) {
			fadeElements[i].classList.remove("animate-fadeIn");
			fadeElements[i].style["visibility"] = "hidden";
		}
		document.onscroll = () => {
			for (var i = 0; i < fadeElements.length; i++) {
				if (
					isInViewport(fadeElements[i]) &&
					!fadeElements[i].classList.contains("animate-fadeIn")
				) {
					fadeElements[i].classList.add("animate-fadeIn");
					fadeElements[i].style["visibility"] = "visible";
				}
			}
		};
	});

	return (
		<>
			<main className="absolute top-0 flex flex-col w-full">
				<section className="relative gradient h-max">
					<div className="h-min px-12 py-10 md:pb-20 top-12 relative">
						<div className="animate-fadeIn md:text-4xl text-xl text-center text-white md:my-0 my-8">
							Explore the most creative profiles in Web 3
						</div>
						<Trending />
						<div className="mb-10 md:mb-0 md:ml-0 mx-auto md:mr-auto w-full md:w-3/5 h-fit md:left-10 md:top-10 relative z-20 animate-fadeRight">
							<img
								src={grid1.src}
								alt="xchanted-grid"
								className="w-full h-auto rounded-sm md:rounded-lg shadow-lg md:shadow-black hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out"
							/>
						</div>
						<div className="w-full md:w-3/5 h-fit mx-auto md:ml-auto md:mr-0 md:right-10 md:bottom-0 z-10 hover:z-20 relative animate-fadeLeft">
							<img
								src={trendingImg.src}
								alt="xchanted-grid"
								className="w-full h-auto rounded-sm md:rounded-lg shadow-lg md:shadow-black hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out"
							/>
						</div>
						<div>
							{/* Something cool here? Popular NFT? Most viewed NFT last 24h ?*/}
						</div>
					</div>
					<div className="w-full md:w-[40vw] h-max absolute md:top-[12vh] top-[200px] right-0 flex flex-col gap-2 items-center z-0">
						<div className="md:h-[30vw] h-[400px] w-[80%] relative">
							<Image
								src={LogoTransparent}
								layout="fill"
								objectFit="contain"
								alt="logo"
							/>
						</div>
					</div>
					<Wave />
					<div className="!font-poppins flex flex-col pt-20 md:pt-6 gap-12 h-auto overflow-y-scroll scrollbar-hide mx-auto md:w-[60vw] w-[85vw] md:text-left text-center relative">
						<ul className="flex flex-col gap-12 items-center justify-center text-center">
							<li className="fade-in invisible flex delay-50 flex-col items-center justify-center gap-4">
								<div
									className="bg-gradient-to-r from-purple-400 to-pink-600 
								rounded-full p-0.5"
								>
									<div className="bg-white rounded-full px-4 py-2">
										<div className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
											Discover . . .
										</div>
									</div>
								</div>
								<div className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
									Discover what people collect and value
									across different chains
								</div>
							</li>
							<li className="fade-in invisible flex delay-100 flex-col items-center justify-center gap-4">
								<div
									className="bg-gradient-to-r from-purple-400 to-pink-600 
								rounded-full p-0.5"
								>
									<div className="bg-white rounded-full px-4 py-2">
										<div className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
											Explore . . .
										</div>
									</div>
								</div>
								<div className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
									Exploreand create a strong network of
									collectors with similar assets to you
								</div>
							</li>
							<li className="fade-in invisible flex flex-col items-center justify-center gap-4">
								<div
									className="bg-gradient-to-r from-purple-400 to-pink-600 
								rounded-full p-0.5"
								>
									<div className="bg-white rounded-full px-4 py-2">
										<div className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
											Connect . . .
										</div>
									</div>
								</div>
								<div className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
									Easily connect with owners of pieces you are
									interested in
								</div>
							</li>
							<div className="mx-auto w-4/5 h-fit relative fade-in">
								<img
									src={walletsImg.src}
									alt="xchanted-wallets"
									className="w-full h-auto rounded-sm md:rounded-lg shadow-lg md:shadow-black hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out"
								/>
							</div>
							<div className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
								Bring all your assets into one place by
								connecting multiple wallets from different
								chains
							</div>
							{/* <div className="fade-in text-xl invisible mx-2 shadow-lg text-white shadow-black bg-gradient-to-r from-purple-400 to-pink-600 p-6 rounded-xl">
								<div>
									Our team is working hard to create a
									platform where people can find value in
									assets without looking at price
								</div>
							</div> */}
						</ul>
						{/* <div className="w-fit mx-auto left-0 right-0 text-center">
							<Link href="/sign-up">
								<a className="w-auto mx-auto">
									<Button text="Get Started!" />
								</a>
							</Link>
						</div> */}
						<Socials />
					</div>
				</section>
			</main>
		</>
	);
}
