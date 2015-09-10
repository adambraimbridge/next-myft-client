/*global process */
'use strict';
var MyFTApi = require('./src/myft-api.js');

module.exports = new MyFTApi({
	apiRoot: 'http://next.ft.com/__myft/api/onsite/',
	headers: {
		'X-API-KEY': process.env.USER_PREFS_API_KEY
	}
});
