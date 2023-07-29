
export async function addNftToQueue(nftQueue, nftId, priority = 3) {
    // TODO: Check validity of inputs
    const t = await nftQueue.add('update_metadata', { nftId }, {
        priority,
    });
    return t;
}