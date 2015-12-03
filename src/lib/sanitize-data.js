'use strict';

const sanitizeBoolean = (str) => {
	if(str === 'true') return true;
	if(str === 'false') return false;
	return str;
};

module.exports = (data) => {
	if(data && !Array.isArray(data)) {
		Object.keys(data).forEach(key => {
			if(typeof data[key] === 'string') {
				data[key] = sanitizeBoolean(data[key]);
			}
		});
		return data;
	} else {
		return data;
	}
};
