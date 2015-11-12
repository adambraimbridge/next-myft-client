'use strict';

var isImmutableUrl = require('./is-immutable-url');

module.exports = function (url, userId) {
	if (isImmutableUrl(url)) {
		return url;
	}

	if(!userId || !userId.length) {
		throw new Error('invalid user uuid: ' + userId);
	}

	return url.replace(/myft(?:\/([a-zA-z\-]*))?(\/.[^$\/])?\/?/, function ($0, $1, $2) {
		return 'myft/' + ($1 ? $1 + '/' : '') + userId + ($2 || '');
	});
};
