'use strict';

var MyFtClient = require('./src/myft-client');

module.exports = new MyFtClient({
	apiRoot: '/__user-prefs/'
});
