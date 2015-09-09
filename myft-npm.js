var MyFTApi = require('./src/myft-api.js');

module.exports = new MyFTApi({
	apiRoot: 'https://ft-next-api-user-prefs-v002.herokuapp.com/',
	headers: {
		'X_API_KEY': process.env.USER_PREFS_API_KEY
	}
});
