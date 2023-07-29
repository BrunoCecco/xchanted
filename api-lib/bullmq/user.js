export async function addUserToQueue(userQueue, userId, priority, newUser) {
	// TODO: Check validity of inputs
	const t = await userQueue.add(
		"update_user",
		{ userId: userId, newUser: newUser },
		{
			priority: priority,
		}
	);
	return t;
}
