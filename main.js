'use strict';

var MyFtClient = require('./src/myft-client');
var cleanUpFollow = require('./src/clean-up-follow');

module.exports = new MyFtClient({
	apiRoot: '/__user-prefs/'
});

cleanUpFollow(module.exports);
