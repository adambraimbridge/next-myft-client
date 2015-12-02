'use strict';

module.exports = function (path) {

	const pathContainsUuid = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(path);
	const pathContainsTwoUuids = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/([a-zA-z\-]*\/)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(path);

	//any path that contains more than one UUID requires exceptional stuff
	const pathIsSavedArticles = /\/saved-articles\//.test(path);
	const pathIsPortfolioDetail = /\/detail\//.test(path);

	if (pathIsSavedArticles) {
		return pathContainsTwoUuids;

	} else if (pathIsPortfolioDetail) {
		return pathContainsTwoUuids;

	} else {
		return pathContainsUuid;
	}
};
