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

		if (method !== 'GET') {
			options.body = JSON.stringify(data || {});
			
			// fiddle content length header to appease Fastly
			if(process && process.env.NODE_ENV === 'production') {
				this.headers['Content-Length'] = Buffer.byteLength(options.body);
			}
		} else {
			// fiddle content length header to appease Fastly
			if(process && process.env.NODE_ENV === 'production') {
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

	getAllRelationship (actor, id, relationship, type, params) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}/${type}`,params);
	}

	getRelationship (actor, id, relationship, type, subject, params) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}/${type}/${subject}`, params);
	}

	addRelationship (actor, id, relationship, type, data) {
		return this.fetchJson('POST', `${actor}/${id}/${relationship}/${type}`, data);
	}

	updateRelationship (actor, id, relationship, type, subject, data) {
		return this.fetchJson('PUT', `${actor}/${id}/${relationship}/${type}/${subject}`, data);
	}

	removeRelationship (actor, id, relationship, type, subject) {
		return this.fetchJson('DELETE', `${actor}/${id}/${relationship}/${type}/${subject}`);
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
