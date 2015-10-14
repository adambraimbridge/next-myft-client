/*global Buffer*/
'use strict';
const fetchres = require('fetchres');

const lib = {
	personaliseUrl: require('./lib/personalise-url'),
	isPersonalisedUrl: require('./lib/is-personalised-url'),
	isImmutableUrl: require('./lib/is-immutable-url')
};


class MyFtApi {
	constructor (opts) {
		if (!opts.apiRoot) {
			throw 'Myft API  must be constructed with an api root';
		}
		this.apiRoot = opts.apiRoot;
		this.headers = Object.assign({
			'Content-Type': 'application/json',
		}, opts.headers);
	}

	fetchJson (method, endpoint, data) {
		let queryString = '';
		let options = {
			method,
			headers: this.headers,
			credentials: 'include'
		};

		//On production servers we need to fiddle the content length to prevent errors at CDN caching
		let needToSetContentLength = process && process.env.NODE_ENV === 'production';

		if (method !== 'GET') {
			if(data) {
				options.body = JSON.stringify(data);
			}
			if(needToSetContentLength) {
				this.headers['Content-Length'] = options.body ? Buffer.byteLength(options.body) : '';
			}
		} else {
			if(needToSetContentLength) {
				this.headers['Content-Length'] = '';
			}

			Object.keys(data || {}).forEach(function(key) {
				if(queryString.length) {
					queryString += `&${key}=${data[key]}`;
				} else {
					queryString += `?${key}=${data[key]}`;
				}
			});
		}

		return fetch(this.apiRoot + endpoint + queryString, options)
			.then(res => {
				if (res.status === 404) {
					throw new Error('No user data exists');
				}
				return res;
			})
			.then(fetchres.json);
	}

	getActor (actor, id) {
		return this.fetchJson('GET', `${actor}/${id}`);
	}

	getAllRelationship (actor, id, relationship, params) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}`,params);
	}

	getRelationship (actor, id, relationship, subject, params) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}/${subject}`, params);
	}

	addRelationship (actor, id, relationship, data) {
		return this.fetchJson('POST', `${actor}/${id}/${relationship}`, data);
	}

	updateRelationship (actor, id, relationship, subject, data) {
		return this.fetchJson('PUT', `${actor}/${id}/${relationship}/${subject}`, data);
	}

	removeRelationship (actor, id, relationship, subject) {
		return this.fetchJson('DELETE', `${actor}/${id}/${relationship}/${subject}`);
	}

	personaliseUrl(url, uuid) {
		return lib.personaliseUrl(url, uuid);
	}

	isPersonalisedUrl(url) {
		return lib.isPersonalisedUrl(url);
	}

	isImmutableUrl(url) {
		return lib.isImmutableUrl(url);
	}
}

module.exports = MyFtApi;
