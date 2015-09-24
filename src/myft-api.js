'use strict';
const fetchres = require('fetchres');

class MyFtApi {
	constructor (opts) {
		if (!opts.apiRoot) {
			throw 'Myft API  must be constructed with an api root';
		}
		this.apiReadRoot = opts.apiReadRoot;
		this.apiWriteRoot = opts.apiWrtieRoot;
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
		var url;

		if (method !== 'GET') {
			options.body = JSON.stringify(data || {});
			url = this.apiWriteRoot + endpoint;
		} else {
			url = this.apiReadRoot + endpoint;
		}

		return fetch(url, options).then(fetchres.json);
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
