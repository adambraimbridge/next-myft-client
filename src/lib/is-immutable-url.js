'use strict';

var isPersonalisedUrl = require('./is-personalised-url');

module.exports = function (url) {
	return /^\/(__)?myft\/api\//.test(url) ||
		/^\/(__)?myft\/product-tour/.test(url) ||
		/^\/(__)?myft\/list/.test(url) ||
		isPersonalisedUrl(url);
};
