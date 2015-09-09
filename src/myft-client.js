'use strict';

const MyftApi = require('./myft-api');
const session = require('next-session-client');
const fetchres = require('fetchres');

class MyFtClient {
	constructor ({apiRoot} = {}) {
		if (!apiRoot) {
			throw 'User prefs must be constructed with an api root';
		}
		this.apiRoot = apiRoot;
		this.loaded = {};
		this.api = new MyftApi({
			apiRoot,
			headers: {

			}
		});
	}

	init ({follow, saveForLater} = {}) {

		if (this.initialised) {
			return Promise.resolve();
		}
		return session.uuid()
			.then(({uuid}) => {

				this.userId = uuid;

				this.api = new MyftApi({
					apiRoot: this.apiRoot,
					headers: {
						'X-FT-Session-Token': session.cookie()
					}
				});

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

	load (relationship) {
		this.api
			.get(this.userId, relationship)
			.then(results => {
				this.loaded[relationship] = results;
				this.emit(`${relationship}.load`, results);
			});
	}

	add (relationship, subject, data) {
		this.api
			.add(this.userId, relationship, subject, data)
			.then(results => {
				this.emit(`${relationship}.add`, {results, subject, data});
			});
	}

	remove (relationship, subject, data) {
		this.api
			.remove(this.userId, relationship, subject)
			.then(result => {
				this.emit(`${relationship}.remove`, {subject, data});
			});
	}

	get (relationship, subject) {
		return new Promise((resolve, reject) => {
			if (this.loaded[relationship]) {
				resolve(this.loaded[relationship].Items.filter(topic => topic.Self.indexOf(subject) > -1));
			} else {
				document.body.addEventListener(`myft.${relationship}.load`, () => {
					resolve(this.loaded[relationship].Items.filter(topic => topic.Self.indexOf(subject) > -1));
				});
			}
		});
	}

	has (relationship, subject) {
		return this.get(relationship, subject)
			.then(items => items.length > 0);
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
