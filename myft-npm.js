/*global process */
'use strict';
var MyFTApi = require('./src/myft-api.js');

module.exports = new MyFTApi({
	apiRoot: process.env.TEST_MYFT_API_ROOT || 'https://myft-api.ft.com/v1/',
	headers: {
		'X-API-KEY': process.env.USER_PREFS_API_KEY || process.env.MYFT_API_KEY
	}
});
