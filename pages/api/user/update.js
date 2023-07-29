// Queues user for update

import nc from "next-connect";
import { ncOpts } from "../../../api-lib/nc";
import { findUserById } from "../../../api-lib/db/user";
import { auths, bullmq, database } from "../../../api-lib/middlewares";

// import { Queue, QueueScheduler } from 'bullmq'
import { addUserToQueue } from "../../../api-lib/bullmq/user";

const handler = nc(ncOpts);
handler.use(database, ...auths, bullmq);

handler.post(async (req, res) => {
	const user = await findUserById(req.db, req.user._id);
	if (!user) {
		return {
			notFound: true,
		};
	}
	const newUserBool = req.body.newUser ? req.body.newUser : false;
	
	const queueResponse = await addUserToQueue(
		req.bullmq.userQueue,
		req.user._id,
		1,
		newUserBool
	);
	console.log(`Adding user ${JSON.stringify(user).substring(0, 5)} to queue`);

	const counts = await req.bullmq.userQueue.getJobCounts('wait', 'delayed');
	console.log(counts.wait)
	
	res.status(200).json({
		status: "success", // TODO: handle errors
		queueResponse,
		queueSize: counts?.wait,
	});
});

export default handler;
