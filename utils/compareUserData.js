export function compareSelected(selected, nftIds) {
	var finalArr = [];
	for (let i = 0; i < selected.length; i++) {
		if (
			selected[i]._id.toString().toLowerCase().indexOf("container") > -1
		) {
			const fileteredContainer = compareSelected(
				selected[i].nfts,
				nftIds
			);
			selected[i].nfts = fileteredContainer;
			finalArr.push(selected[i]);
			continue;
		}
		if (filterThroughNfts(selected[i]._id, nftIds)) {
			finalArr.push(selected[i]);
			continue;
		}
	}
	return finalArr;
}

export function filterThroughNfts(idToCompare, nftIds) {
	for (let i = 0; i < nftIds.length; i++) {
		if (
			nftIds[i]?.toString().toLowerCase() ==
			idToCompare?.toString().toLowerCase()
		) {
			return true;
		}
	}
	console.log("Username nft is invalid");
	return false;
}
