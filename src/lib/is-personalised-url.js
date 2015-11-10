'use strict';

module.exports = function (path) {
	return (!/myft\/list\//.test(path)) && /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(path);
};
