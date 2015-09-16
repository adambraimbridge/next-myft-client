'use strict';

const session = require('next-session-client');
const fetchres = require('fetchres');

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

				this.initialised = true;

			});
	}

	emit (name, data) {
		document.body.dispatchEvent(new CustomEvent(`myft.${name}`, {
			detail: data,
			bubbles: true
		}));
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

	load (verb) {
		this.fetchJson('GET', `${this.userId}/${verb}`)
			.then(results => {
				this.loaded[verb] = results;
				this.emit(`${verb}.load`, results);
			});
	}

	add (verb, subject, meta) {
		this.fetchJson('PUT', `${this.userId}/${verb}/${subject}`, meta)
			.then(results => {
				this.emit(`${verb}.add`, {results, subject, meta});
			});
	}

	remove (verb, subject, meta) {
		this.fetchJson('DELETE', `${this.userId}/${verb}/${subject}`)
			.then(result => {
				this.emit(`${verb}.remove`, {subject, meta});
			});
	}

	get (verb, subject) {
		return new Promise((resolve, reject) => {

			if (this.loaded[verb]) {
				resolve(this.getItems(verb).filter(topic => this.getUuid(topic).indexOf(subject) > -1));
			} else {
				document.body.addEventListener(`myft.${verb}.load`, () => {
					resolve(this.getItems(verb).filter(topic => this.getUuid(topic).indexOf(subject) > -1));
				});
			}
		});
	}

	has (verb, subject) {
		return this.get(verb, subject)
			.then(items => items.length > 0);
	}

	getUuid (topic) {
		return topic.UUID || topic.uuid;
	}

	getItems (verb) {
		return this.loaded[verb].Items || this.loaded[verb].items || [];
	}

	personaliseUrl (url) {
		return session.uuid()
			.then(({uuid}) => {
				if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(url)) {
					return url;
				}

				return url.replace(/myft(\/(?:my-news|saved-articles|my-topics|portfolio|average-push-frequency))?\/?/, function ($0, $1) {
					return `myft${$1 || ''}/${uuid}`;
				});
			});
	}
}

export default MyFtClient;
