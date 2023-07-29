import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Icon from "../elements/Icon";
import { MdCheck } from "react-icons/md";

// TODO: make this ENV variable
const serverSocketEndpoint = "https://xchanted-wss.onrender.com"; //ws://64.227.37.243:6969/"// process.env.NODE_ENV == "development"? "ws://localhost:6969/": "";

const Updates = ({ socketId, setIsUpdatingWallets }) => {
	useEffect(() => socketInitializer(), []);
	const [message, setMessage] = useState("Syncing user");
	const [progress, setProgress] = useState("0"); // Progress percentage
	const [wsInstance, setWsInstance] = useState(null);

	const socketInitializer = async () => {
		const isBrowser = typeof window !== "undefined";
		if (!isBrowser) return setWsInstance(null);

		// if(wsInstance?.readyState !== 3) {
		//   wsInstance.disconnect();
		// }

		let socket = io(serverSocketEndpoint);

		socket.on("connect", () => {
			console.log("connected to worker updates");
		});

		console.log(`SID: ${JSON.stringify(socketId)}`);

		socket.on(socketId, (m) => {
			// console.log(`Socket message: ${m}`);
			if (isNaN(m)) {
				setMessage(m);
				if (m && m.startsWith("Finished")) {
					// setTimeout(() => {
					// 	setIsUpdatingWallets(false);
					// }, 60000) // 1 minute timeout after update
				}
			} else {
				setProgress(parseInt(m));
			}
		});

		setWsInstance(socket);
	};

	function disconnect() {
		if (wsInstance) {
			wsInstance.disconnect();
			setWsInstance(null);
			setIsUpdatingWallets(false);
		}
	}

	return (
		<div className="flex flex-col items-center justify-center gap-2 text-xs mx-auto">
			{message}
			<div className="mx-auto w-36 flex items-center justify-center gap-2">
				<progress
					id="progress-bar"
					value={progress.toString()}
					max="100"
				></progress>
				{progress == "100" && (
					<Icon onClick={disconnect} size="sm" icon={<MdCheck />} />
				)}
			</div>
		</div>
	);
};

export default Updates;
