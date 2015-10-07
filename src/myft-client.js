'use strict';

const session = require('next-session-client');
const fetchres = require('fetchres');

const lib = {
	personaliseUrl: require('./lib/personalise-url')
};

const emptyResponse = {
	total: 0,
	items: [],
	count: 0
};

class MyFtClient {
	constructor ({apiRoot} = {}) {
		if (!apiRoot) {
			throw 'User prefs must be constructed with an api root';
		}
		this.apiRoot = apiRoot;
		this.loaded = {};
	}

	init ({follow, saveForLater} = {}) {

		if (this.initialised) {
			return Promise.resolve();
		}
		this.initialised = true;
		return session.uuid()
			.then(({uuid}) => {

				this.userId = uuid;

				this.headers = {
					'Content-Type': 'application/json',
					'X-FT-Session-Token': session.cookie()
				};

				if (follow) {
					this.load('followed');
				}

				if (saveForLater) {
					this.load('saved');
				}

				this.load('preferred');
				this.load('enabled');

			});
	}

	emit (name, data) {
		document.body.dispatchEvent(new CustomEvent(`myft.${name}`, {
			detail: data,
			bubbles: true
		}));
	}

	fetchJson (method, endpoint, data) {
		var options = {
			method,
			headers: this.headers,
			credentials: 'include'
		};

		if (method !== 'GET') {
			options.body = JSON.stringify(data || {});
		}
		return fetch(this.apiRoot + endpoint, options)
			.then(fetchres.json);

	}

	load (relationship) {
		this.fetchJson('GET', `${this.userId}/${relationship}`)
			.then(results => {
				if(!results) {
					results = emptyResponse;
				}
				this.loaded[relationship] = results;
				this.emit(`${relationship}.load`, results);
			})
			.catch(err => {
				if (err.message === 'No user data exists') {
					this.loaded[relationship] = emptyResponse;
					this.emit(`${relationship}.load`, this.loaded[relationship]);
				} else {
					throw err;
				}
			});
	}

	add (relationship, subject, data) {
		this.fetchJson('PUT', `${this.userId}/${relationship}/${subject}`, data)
			.then(results => {
				this.emit(`${relationship}.add`, {results, subject, data});
			});
	}

	remove (relationship, subject, data) {
		this.fetchJson('DELETE', `${this.userId}/${relationship}/${subject}`)
			.then(()=> {
				this.emit(`${relationship}.remove`, {subject, data});
			});
	}

	get (relationship, subject) {
		return new Promise((resolve) => {
			if (this.loaded[relationship]) {
				resolve(this.getItems(relationship).filter(topic => this.getUuid(topic).indexOf(subject) > -1));
			} else {
				document.body.addEventListener(`myft.${relationship}.load`, () => {
					resolve(this.getItems(relationship).filter(topic => this.getUuid(topic).indexOf(subject) > -1));
				});
			}
		});
	}

	has (relationship, subject) {
		return this.get(relationship, subject)
			.then(items => items.length > 0);
	}

	getUuid (topic) {
		return topic.uuid;
	}

	getItems (relationship) {
		return this.loaded[relationship].items || [];
	}

	personaliseUrl (url) {
		return session.uuid()
			.then(({uuid}) => {
				return lib.personaliseUrl(url, uuid);
			});
	}
}

export default MyFtClient;
