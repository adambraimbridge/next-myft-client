'use strict';
const fetchres = require('fetchres');

class MyFtApi {
	constructor ({apiRoot, headers} = {}) {
		if (!apiRoot) {
			throw 'Myft API  must be constructed with an api root';
		}
		this.apiRoot = apiRoot;
		this.headers = Object.assign({
			'Content-Type': 'application/json',
		}, headers);
	}

	fetchJson (method, endpoint, meta) {
		var options = {
			method,
			headers: this.headers,
			credentials: 'include'
		};

		if (method !== 'GET') {
			options.body = JSON.stringify(meta || {});
		}
		return fetch(this.apiRoot + endpoint, options)
			.then(fetchres.json);
	}

	add (actor, relationship, subject, data) {
		return this.fetchJson('PUT', `${actor}/${relationship}/${subject}`, data);
	}

	remove (actor, relationship, subject) {
		return this.fetchJson('DELETE', `${actor}/${relationship}/${subject}`);
	}

	get (actor, relationship) {
		return this.fetchJson('GET', `${actor}/${relationship}`);
	}
}

export default MyFtApi;
