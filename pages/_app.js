import "../styles/globals.css";
import "../styles/gradientbg.css";
import "../styles/index.css";
import Layout from "../components/layout/layout";
import { Toaster } from "react-hot-toast";
import NextNProgress from "nextjs-progressbar";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import * as gtag from "../lib/gtag";
import logo from "../public/logo.svg";
import ModalRoot from "../components/modals/ModalRoot";

function MyApp({ Component, pageProps }) {
	const router = useRouter();

	useEffect(() => {
		const handleRouteChange = (url) => {
			gtag.pageview(url);
		};
		//When the component is mounted, subscribe to router changes
		//and log those page views
		router.events.on("routeChangeComplete", handleRouteChange);

		// If the component is unmounted, unsubscribe
		// from the event with the `off` method
		return () => {
			router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, [router.events]);

	return (
		<>
			<Layout>
				<NextNProgress
					color="#4442df"
					startPosition={0.3}
					stopDelayMs={50}
					height={3}
				/>
				<Component {...pageProps} />
				<ModalRoot />
				<Toaster />
			</Layout>
		</>
	);
}

export default MyApp;
