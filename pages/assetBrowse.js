import { findUserById, findNfts } from "../api-lib/db/user";
import { database, auths } from "../api-lib/middlewares";
import { useCurrentUser } from "../lib/user";
import { useRouter } from "next/router";
import nc from "next-connect";
import Head from "next/head";
import Image from "next/image";
import Card from "../components/nft/card";
import { fetcher } from "../lib/fetch";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

export default function AssetBrowse({ user, nfts }) {
	const router = useRouter();
	const { data, error, mutate } = useCurrentUser();

	const [nftData, setNftData] = useState(JSON.parse(nfts));

	const [q, setQ] = useState("");
	const [searchParam] = useState(["name", "symbol", "_id"]);

	const [selected, setSelected] = useState([]);

	useEffect(() => {
		if (!data && !error) return; // useCurrentUser might still be loading
		if (!data.user) {
			router.replace("/sign-in");
		} else {
			setSelected(data.user.selected);
		}
	}, [router, data, error]);
	if (!data?.user) return null;

	const select = (item) => {
		if (
			selected.length > 0 &&
			selected.findIndex((el) => el._id === item._id) != -1
		) {
			setSelected(selected.filter((el) => el._id !== item._id));
		} else {
			const obj = {
				_id: item._id,
				cols: 3,
				rows: 3,
			};
			setSelected([...selected, obj]);
		}
	};

	const save = async () => {
		let newSelected = [];
		if (selected.length == 0) {
			// if nothing selected, select all the nfts
			for (let i = 0; i < user.nfts.length; i++) {
				console.log(user.nfts[i]);
				const obj = {
					_id: user.nfts[i],
					cols: 3,
					rows: 3,
				};
				newSelected.push(obj);
			}
		} else {
			newSelected = selected;
		}
		try {
			const response = await fetcher("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					selected: newSelected,
					type: "nft",
				}),
			});
			mutate({ user: response.user }, false);
			toast.success("Selected NFTs saved");
		} catch (e) {
			toast.error(e.message);
			console.error(e.message);
		}
	};

	const open = (item) => {
		//setMoreData(item);
		//setVisible(true);

		router.push({
			pathname: "../asset/[id]",
			query: {
				id: item._id,
				username: JSON.stringify(data.user.username),
			},
		});
	};

	function search(items) {
		return items.filter((item) => {
			return searchParam.some((newItem) => {
				if (item.name) {
					return (
						item[newItem]
							.toString()
							.toLowerCase()
							.indexOf(q.toLowerCase()) > -1
					);
				} else {
					return;
				}
			});
		});
	}

	return (
		<>
			<Head>
				<title>
					{data.user.name} (@{data.user.username})
				</title>
			</Head>
			<div className="w-full flex-wrap flex gap-4 items-center justify-center">
				<button onClick={save}>SAVE</button>
				<input
					type="search"
					name="search-form"
					id="search-form"
					className="search-input"
					placeholder="Search for..."
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
				{nftData &&
					search(nftData).map((item, index) => (
						<div key={index} id={index}>
							{item?.metadata?.image && (
								<div
									onClick={() => select(item)}
									className={`${
										selected.length > 0 &&
										selected.findIndex(
											(el) => el._id === item._id
										) != -1
											? "border-8 border-sky-500"
											: ""
									}`}
								>
									<Card item={item} index={index} />
								</div>
							)}
						</div>
					))}
			</div>
		</>
	);
}

export async function getServerSideProps(context) {
	await nc()
		.use(database, ...auths)
		.run(context.req, context.res);

	const user = await findUserById(context.req.db, context.req.user._id);
	if (!user) {
		return {
			notFound: true,
		};
	}

	user._id = String(user._id);

	const nftsCursor = await findNfts(
		context.req.db,
		user.nfts,
		context.req.user ? context.req.user._id : null
	);
	const nfts = JSON.stringify(await nftsCursor.toArray());
	return { props: { user, nfts } };
}
