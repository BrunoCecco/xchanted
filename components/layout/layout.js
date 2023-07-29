import Header from "./header";
import { useState } from "react";
import Head from "next/head";

export default function Layout({ children }) {
	return (
		<>
			<Head>
				<title>Xchanted</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Header />
			<div className="!font-poppins">
				<main
					className={`max-w-screen
					`}
				>
					{children}
				</main>
			</div>
		</>
	);
}
