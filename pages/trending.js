// import { database, auths } from '../api-lib/middlewares';
import { useRouter } from "next/router";
// import nc from 'next-connect';
import Head from "next/head";
import Username from "../components/elements/Username";
import ProfilePicture from "../components/elements/ProfilePicture";
// import { getCollectionsByAllTimeViewCount, getNftsByAllTimeViewCount, getNftsByHighestAppreciates, getUsersByAllTimeViewCount } from '../api-lib/db/analytics';
import { useEffect, useState } from "react";
import NftImage from "../components/nft/NftImage";
import Image from "next/image";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import Dropdown from "../components/elements/Dropdown";
import { fetcher } from "../lib/fetch";
import { BiUpArrow, BiDownArrow } from "react-icons/bi";

const Row = ({ index, onClick, image, name, columns }) => {
	return (
		<tr className="hover:shadow-lg cursor-pointer" onClick={onClick}>
			<td className="text-center">{index}</td>
			<td className="border-t-2 p-2">
				<div className="flex w-full items-center gap-4">
					<div className="w-16 h-16 relative flex items-center justify-center">
						{image}
					</div>
					<div>{name}</div>
				</div>
			</td>
			{columns &&
				columns.map((c, i) => (
					<td
						className="border-t-2 p-2 text-right"
						key={"column" + i}
					>
						{c}
					</td>
				))}
		</tr>
	);
};

export default function AssetBrowse() {
	const router = useRouter();
	const [arr, setArr] = useState([]);
	const [categories, setCategories] = useState([
		"NFTs",
		"Collections",
		"Accounts",
	]);
	const [activeCategory, setActiveCategory] = useState(0);
	const [limit, setLimit] = useState(15); // Get stuff 10 at a time
	const [offset, setOffset] = useState(0);
	const orderByOptions = {
		// catogory label to order by parameter
		NFTs: ["Views", "Appreciates"],
		Collections: ["Views", "Followers", "Xchanted Owners"],
		Accounts: ["Views", "Followers", "Nft Count"],
	};
	const [orderByOptionIndex, setOrderByOptionIndex] = useState(0);

	// filters
	const [chains, setChains] = useState(["Ethereum", "Solana"]);
	const [chain, setChain] = useState(-1); // 0 - eth, 1 - sol
	const [sort, setSort] = useState(-1); // descending = -1 , ascending = 1
	const [duration, setDuration] = useState("24h"); // upcoming feature

	useEffect(async () => {
		if (router.query.category) {
			const index = categories
				.map((t) => t.toLowerCase())
				.indexOf(router.query.category.toLowerCase());
			if (index > -1) setActiveCategory(index);
		}

		// Load initial data
		let data = await fetcher(
			`/api/rankings/${categories[activeCategory].toLowerCase()}?type=${
				orderByOptions[categories[activeCategory]][orderByOptionIndex]
			}&limit=${limit}&skip=${offset}&chain=${chain}&sort=${sort}`
		);
		setArr(arr.concat(data));
	}, [router, activeCategory, limit, offset, chain, sort]);

	const fetchMoreData = () => {
		setOffset(offset + limit);
	};

	const open = (url) => {
		router.push(url);
	};

	const switchChain = (e) => {
		setChain(chains.indexOf(e.value));
		setOffset(0);
		setArr([]);
	};

	const switchCategory = (e) => {
		let i = categories.indexOf(e.value);
		setActiveCategory(i);
		setOffset(0);
		setArr([]);
		if (i == 2) setChain(-2);
		else setChain(-1);
	};

	const clickOrderOption = (i) => {
		setOrderByOptionIndex(i);
		setSort(sort === -1 ? 1 : -1);
		setArr([]);
		setOffset(0);
	};

	return (
		<>
			<Head>
				<title>Trending</title>
			</Head>

			<div className="wrapper flex flex-col gap-8 p-8 w-[90vw] md:w-[80vw] mx-auto relative">
				<div className="font-bold text-4xl text-center">
					Top {chains[chain]} {categories[activeCategory]}{" "}
					{chain < 0 && " from all chains"}
				</div>
				<div className="flex items-center justify-center gap-4">
					<Dropdown
						options={categories}
						onChange={switchCategory}
						value={"Category"}
					/>
					<Dropdown
						options={["All Chains"].concat(chains)}
						value={"Chain"}
						onChange={switchChain}
					/>
				</div>

				<div className="stats overflow-auto flex flex-col-reverse w-full">
					<InfiniteScroll
						dataLength={arr.length}
						next={() => fetchMoreData()}
						hasMore={true}
						loader={
							<div className="w-full p-4 text-center text-lg">
								Loading...
							</div>
						}
					>
						<table className="table-auto w-full border-collapse">
							<thead>
								<tr>
									<th className="p-2"></th>
									<th className="p-2"></th>
									{orderByOptions[
										categories[activeCategory]
									].map((option, i) => {
										return (
											<th
												key={option + i}
												onClick={() =>
													clickOrderOption(i)
												}
												className="p-2"
											>
												<div className="cursor-pointer flex gap-2 items-center justify-end text-sm">
													<div className="px-4 py-2 border-gray-500 border-2 rounded-full hover:opacity-75">
														{option}
													</div>
													{orderByOptionIndex == i ? (
														sort == 1 ? (
															<BiUpArrow />
														) : (
															<BiDownArrow />
														)
													) : (
														""
													)}
												</div>
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody>
								{categories[activeCategory] === "NFTs" &&
									arr.map((nft, i) => {
										return (
											<Row
												key={nft._id + i}
												index={i + 1}
												onClick={() =>
													open(`/asset/${nft._id}`)
												}
												image={
													<NftImage
														metadata={nft.metadata}
														classname={
															"cursor-pointer w-full h-full shadow-xl bg-cover bg-center overflow-hidden rounded-2xl"
														}
														inNftPage={true}
													/>
												}
												name={
													nft?.metadata?.name ||
													nft?.name
												}
												columns={[
													nft?.views?.allTime || 0,
													nft?.appreciatesCount || 0,
												]}
											/>
										);
									})}
								{categories[activeCategory] === "Collections" &&
									arr.map((collection, i) => {
										return (
											<Row
												key={collection._id + i}
												index={i + 1}
												onClick={() =>
													open(
														`/collection/${collection?._id}`
													)
												}
												image={
													<Image
														src={
															collection?.image_url
														}
														className="cursor-pointer h-full w-full rounded-2xl"
														alt=""
														layout="fill"
														objectFit="cover"
													/>
												}
												name={collection?.name}
												columns={[
													collection?.views
														?.allTime || 0,
													collection?.followersCount ||
														0,
													"--",
												]}
											/>
										);
									})}
								{categories[activeCategory] === "Accounts" &&
									arr.map((user, i) => {
										return (
											<Row
												key={user._id + i}
												index={i + 1}
												onClick={() =>
													open(
														`/@${user?.username}`
													)
												}
												name={<Username user={user} />}
												image={
													<ProfilePicture
														user={user}
													/>
												}
												columns={[
													user?.views?.allTime || 0,
													user?.followersCount || 0,
													user?.nftCount || 0,
												]}
											/>
										);
									})}
							</tbody>
						</table>
					</InfiniteScroll>
				</div>
			</div>
		</>
	);
}
