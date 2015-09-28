/*global Buffer*/
'use strict';
const fetchres = require('fetchres');

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
		var options = {
			method,
			headers: this.headers,
			credentials: 'include'
		};

		if (method !== 'GET') {
			options.body = JSON.stringify(data || {});
			if(process) {
				this.headers['Content-Length'] = Buffer.byteLength(options.body);
			}
		} else {
			if(process) {
				this.headers['Content-Length'] = '';
			}
		}
		return fetch(this.apiRoot + endpoint, options)
			.then(fetchres.json);
	}

	getActor (actor, id) {
		return this.fetchJson('GET', `${actor}/${id}`);
	}

	getAllRelationship (actor, id, relationship) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}`);
	}

	getRelationship (actor, id, relationship, subject) {
		return this.fetchJson('GET', `${actor}/${id}/${relationship}/${subject}`);
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
}

module.exports = MyFtApi;
