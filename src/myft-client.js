'use strict';
require('core-js/fn/set');

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

	/**
	 * loads user's preferred and enabled relationships, as well as requested additional relationships
	 * @param additionalRelationships
	 * @returns {*}
	 */
	init (additionalRelationships = []) {

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

				let relationships = new Set([
					{relationship: 'preferred', type: 'preference'},
					{relationship: 'enabled', type: 'endpoint'}
				]);

				additionalRelationships.forEach(rel => {
					if(!relationships.has(rel)) { relationships.add(rel); }
				});

				relationships.forEach(relationship => this.load(relationship));

			});
	}

	emit (name, data) {
		document.body.dispatchEvent(new CustomEvent(`myft.${name}`, {
			detail: data,
			bubbles: true
		}));
	}

	fetchJson (method, endpoint, data) {
		let options = {
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
		const key = `${relationship.relationship}.${relationship.type}`;

		this.fetchJson('GET', `${this.userId}/${relationship.relationship}/${relationship.type}`)
			.then(results => {
				if(!results) {
					results = emptyResponse;
				}
				this.loaded[key] = results;
				this.emit(`${key}.load`, results);
			})
			.catch(err => {
				if (err.message === 'No user data exists') {
					this.loaded[key] = emptyResponse;
					this.emit(`${key}.load`, emptyResponse);
				} else {
					throw err;
				}
			});
	}

	add (relationship, type, subject, data) {
		this.fetchJson('PUT', `${this.userId}/${relationship}/${type}/${subject}`, data)
			.then(results => {
				this.emit(`${relationship}.${type}.add`, {results, subject, data});
			});
	}

	remove (relationship, type, subject, data) {
		this.fetchJson('DELETE', `${this.userId}/${relationship}/${type}/${subject}`)
			.then(()=> {
				this.emit(`${relationship}.${type}.remove`, {subject, data});
			});
	}

	get (relationship, type, subject) {
		return this.getAll(relationship, type).then(items => {
			return items.filter(item => this.getUuid(item).indexOf(subject) > -1);
		});
	}

	getAll (relationship, type) {
		return new Promise((resolve) => {
			if (this.loaded[`${relationship}.${type}`]) {
				resolve(this.getItems(relationship, type));
			} else {
				document.body.addEventListener(`myft.${relationship}.${type}.load`, () => {
					resolve(this.getItems(relationship, type));
				});
			}
		});
	}

	has (relationship, type, subject) {
		return this.get(relationship, type, subject)
			.then(items => items.length > 0);
	}

	getUuid (topic) {
		return topic.uuid;
	}

	getItems (relationship, type) {
		return this.loaded[`${relationship}.${type}`].items || [];
	}

	personaliseUrl (url) {
		return session.uuid()
			.then(({uuid}) => {
				return lib.personaliseUrl(url, uuid);
			});
	}
}

export default MyFtClient;
