/* global console, fetch */
'use strict';

const session = require('next-session-client');
const fetchres = require('fetchres');

const verbConfig = {
	used: {
		category: 'activities',
		subjectPrefix: 'Feature:'
	},
	followed: {
		category: 'activities',
		subjectPrefix: 'Topic:'
	},
	forlater: {
		category: 'activities',
		subjectPrefix: 'Article:'
	},
	preferred: {
		category: 'activities',
		subjectPrefix: 'Preference:'
	},
	articleFromFollow: {
		category: 'events',
		subjectPrefix: 'Article:'
	}
};

class MyFtClient {
	constructor ({apiRoot} = {}) {
		if (!apiRoot) {
			throw 'User prefs must be constructed with an api root';
		}
		this.apiRoot = apiRoot;
		this.loaded = {};
	}

	init (opts = {}) {

		if (this.initialised) {
			return Promise.resolve();
		}

		return session.uuid()
			.then(({uuid}) => {

				this.userId = 'User:guid-' + uuid;

				this.headers = {
					'Content-Type': 'application/json',
					'X-FT-Session-Token': session.cookie()
				};

				if (opts.follow) {
					this.load('followed');
				}

				if (opts.saveForLater) {
					this.load('forlater');
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

	fetch (method, endpoint, meta) {

		var options = {
			method: method,
			headers: this.headers,
			credentials: 'include'
		};

		if (method !== 'GET') {
			options.body = (meta) ? JSON.stringify(meta) : '';
		}

		return fetch(this.apiRoot + endpoint, options)
			.then(fetchres.json);

	}

	load (verb) {
		this.fetch('GET', `${verbConfig[verb].category}/${this.userId}/${verb}/${verbConfig[verb].subjectPrefix}`)
			.then(results => {
				this.loaded[verb] = results;
				this.emit(`${verb}.load`, results);
			});
	}

	add (verb, subject, meta) {
		this.fetch('PUT', `${verbConfig[verb].category}/${this.userId}/${verb}/${verbConfig[verb].subjectPrefix}${subject}`, meta)
			.then(results => {
				this.emit(`${verb}.add`, {
					results: results,
					subject: subject,
					meta: meta
				});
			});
	}

	remove (verb, subject, meta) {
		this.fetch('DELETE', `${verbConfig[verb].category}/${this.userId}/${verb}/${verbConfig[verb].subjectPrefix}${subject}`)
			.then(result => {
				this.emit(`${verb}.remove`, {
					subject: subject,
					meta: meta
				});
			});
	}

	get (verb, subject) {
		return new Promise((resolve, reject) => {

			if (this.loaded[verb]) {
				resolve(this.loaded[verb].Items.filter(topic => topic.Self.indexOf(subject) > -1));
			} else {
				document.body.addEventListener(`myft.${verb}.load`, () => {
					resolve(this.loaded[verb].Items.filter(topic => topic.Self.indexOf(subject) > -1));
				});
			}
		});
	}

	has (verb, subject) {
		return this.get(verb, subject)
			.then(items => items.length > 0);
	}

	personaliseUrl (url) {
		return session.uuid()
			.then(({uuid}) => {
				if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(url)) {
					return url;
				}

				return url.replace(/myft(\/(?:my-news|saved-articles|my-topics|portfolio))?\/?/, function ($0, $1) {
					return `myft${$1 || ''}/${uuid}`;
				});
			});
	}
};

export default MyFtClient;
