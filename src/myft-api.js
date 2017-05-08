'use strict';

/*global Buffer*/
const fetchres = require('fetchres');
const BlackHoleStream = require('black-hole-stream');

const lib = {
	sanitizeData: require('./lib/sanitize-data'),
	personaliseUrl: require('./lib/personalise-url'),
	isPersonalisedUrl: require('./lib/is-personalised-url'),
	isImmutableUrl: require('./lib/is-immutable-url'),
	isValidUuid: require('./lib/is-valid-uuid')
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

	fetchJson (method, endpoint, data, opts) {
		opts = opts || {};

		let queryString = '';
		let options = Object.assign({
			method,
			headers: this.headers,
			credentials: 'include'
		}, opts);


		if(/undefined/.test(endpoint)) {
			return Promise.reject('Request should not contain undefined.');
		}

		//Sanitize data
		data = lib.sanitizeData(data);

		if (method !== 'GET') {

			// fiddle content length header to appease Fastly
			if(process && process.env.NODE_ENV === 'production') {

				// Fastly requires that empty requests have an empty object for a body and local API requires that
				// they don't
				options.body = JSON.stringify(data || {});

				this.headers['Content-Length'] = Buffer.byteLength(options.body);

			} else {
				options.body = data ? JSON.stringify(data) : null;
			}
		} else {

			if(process && process.env.NODE_ENV === 'production') {
				this.headers['Content-Length'] = 0;
			}

			Object.keys(data || {}).forEach(function (key) {
				if(queryString.length) {
					queryString += `&${key}=${data[key]}`;
				} else {
					queryString += `?${key}=${data[key]}`;
				}
			});
		}

		options.headers['Fastly-Debug'] = 'true';
		options.headers['FT-Debug'] = 'true';

		return fetch(this.apiRoot + endpoint + queryString, options)
			.then(res => {


				options.headers['X-API-KEY'] = 'secret';
				console.log('FETCH to ', this.apiRoot + endpoint + queryString);
				console.log('with opts ', JSON.stringify(options, null, 3));
				console.log('X-Cache: ', res.headers.get('X-Cache'));
				console.log('Age: ', res.headers.get('Age'));
				console.log('X-Served-By: ', res.headers.get('X-Served-By'));
				console.log('Surrogate-Key: ', res.headers.get('Surrogate-Key'));
				console.log('Fastly-Debug-Digest: ', res.headers.get('Fastly-Debug-Digest'));
				console.log('Fastly-Debug-Path: ', res.headers.get('Fastly-Debug-Path'));
				console.log('Fastly-Debug-TTL: ', res.headers.get('Fastly-Debug-TTL'));

				if (res.status === 404) {
					res.body.pipe(new BlackHoleStream());
					throw new Error('No user data exists');
				}
				return res;
			})
			.then(fetchres.json)
			.then(json => {
				if(json.items) {
					console.log('Items returned: ', json.items.length);
				}
				console.log('\n');
				return json;
			});
	}

	addActor (actor, data, opts) {
		return this.fetchJson('POST', actor, data, opts);
	}

	getActor (actor, id, opts) {
		return this.fetchJson('GET', `${actor}/${id}`, null, opts);
	}

	updateActor (actor, id, data, opts) {
		return this.fetchJson('PUT', `${actor}/${id}`, data, opts);
	}

	removeActor (actor, id, opts) {
		return this.fetchJson('DELETE', `${actor}/${id}`, null, opts);
	}

	getAllRelationship (actor, id, relationship, type, params, opts) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}/${type}`, params, opts);
	}

	getRelationship (actor, id, relationship, type, subject, params, opts) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}/${type}/${subject}`, params, opts);
	}

	addRelationship (actor, id, relationship, type, data, opts) {
		return this.fetchJson('POST', `${actor}/${id}/${relationship}/${type}`, data, opts);
	}

	updateRelationship (actor, id, relationship, type, subject, data, opts) {
		return this.fetchJson('PUT', `${actor}/${id}/${relationship}/${type}/${subject}`, data, opts);
	}

	removeRelationship (actor, id, relationship, type, subject, opts) {
		return this.fetchJson('DELETE', `${actor}/${id}/${relationship}/${type}/${subject}`, null, opts);
	}

	purgeActor (actor, id, opts) {
		return this.fetchJson('POST', `purge/${actor}/${id}`, null, opts);
	}

	purgeRelationship (actor, id, relationship, opts) {
		return this.fetchJson('POST', `purge/${actor}/${id}/${relationship}`, null, opts);
	}

	personaliseUrl (url, uuid) {
		return lib.personaliseUrl(url, uuid);
	}

	isPersonalisedUrl (url) {
		return lib.isPersonalisedUrl(url);
	}

	isImmutableUrl (url) {
		return lib.isImmutableUrl(url);
	}

	isValidUuid (str) {
		return lib.isValidUuid(str);
	}
}

module.exports = MyFtApi;
