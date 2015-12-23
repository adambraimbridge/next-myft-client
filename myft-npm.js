/*global process */
'use strict';
var MyFTApi = require('./src/myft-api.js');

module.exports = new MyFTApi({
	apiRoot: process.env.MYFT_API_URL,
	headers: {
		'X-API-KEY': process.env.MYFT_API_KEY
	}
});
