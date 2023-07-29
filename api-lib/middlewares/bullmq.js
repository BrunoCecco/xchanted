import { Queue, QueueScheduler } from "bullmq";
global.bullmq = global.bullmq || {};

let redisOptions = {
	connection: {
		host: "redis-13208.c232.us-east-1-2.ec2.cloud.redislabs.com",
		port: 13208,
		password: "9V46UFXAACQyxGgGhrIMqHQqqYDr7EZe",
	},
};

export function getUserQueueConnection() {
	if (!global.bullmq.userQueue) {
		global.bullmq.userQueue = new Queue("user", redisOptions);

		// Make a scheduler as well
		global.bullmq.userQueueScheduler = new QueueScheduler(
			"user",
			redisOptions
		);

		console.log("Creating BullMQ User Queue connection");
	}
	return global.bullmq.userQueue;
}

export function getNftQueueConnection() {
	if (!global.bullmq.nftQueue) {
		global.bullmq.nftQueue = new Queue("nft", redisOptions);

		// Make a scheduler as well
		global.bullmq.nftQueueScheduler = new QueueScheduler(
			"nft",
			redisOptions
		);
		console.log("Creating BullMQ NFT Queue connection");
	}
	return global.bullmq.nftQueue;
}

export default async function bullmq(req, res, next) {
	if (!global.bullmq.userQueue) {
		global.bullmq.userQueue = getUserQueueConnection();
	}
	if (!global.bullmq.nftQueue) {
		global.bullmq.nftQueue = getNftQueueConnection();
	}
	req.bullmq = {};
	req.bullmq.userQueue = global.bullmq.userQueue;
	req.bullmq.nftQueue = global.bullmq.nftQueue;
	return next();
}
