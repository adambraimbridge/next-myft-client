'use strict';

const isPersonalisedUrl = require('./is-personalised-url');

module.exports = url => /^\/(__)?myft\/api\//.test(url) ||
	/^\/(__)?myft\/product-tour/.test(url) ||
	/^\/(__)?myft\/list/.test(url) ||
	isPersonalisedUrl(url);
