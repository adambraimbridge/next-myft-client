'use strict';
require('core.js/fn/set');

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

			})
			.catch(e => {
				// Keeps console clean for anonymous users
				if (e.message === 'No session cookie found') {
					return;
				}
				throw e;
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
				this.emit(`user.${key}.load`, results);
			})
			.catch(err => {
				if (err.message === 'No user data exists') {
					this.loaded[key] = emptyResponse;
					this.emit(`user.${key}.load`, emptyResponse);
				} else {
					throw err;
				}
			});
	}

	add (actor, actorId, relationship, type, subject, data) {
		actorId = this.getFallbackActorIdIfNecessary(actor, actorId);
		this.fetchJson('PUT', `${actor}/${actorId}/${relationship}/${type}/${subject}`, data)
			.then(results => {
				this.emit(`${actor}.${relationship}.${type}.add`, {actorId, results, subject, data});
			});
	}

	remove (actor, actorId, relationship, type, subject, data) {
		actorId = this.getFallbackActorIdIfNecessary(actor, actorId);
		this.fetchJson('DELETE', `${actor}/${actorId}/${relationship}/${type}/${subject}`)
			.then(()=> {
				this.emit(`${actor}.${relationship}.${type}.remove`, {actorId, subject, data});
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
				document.body.addEventListener(`myft.user.${relationship}.${type}.load`, () => {
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

	//private
	getFallbackActorIdIfNecessary (actor, actorId) {
		if(!actorId) {
			if(actor === 'user') {
				return this.userId;
			} else {
				throw new Error('no actorId specified');
			}
		} else {
			return actorId;
		}
	}
}

export default MyFtClient;
