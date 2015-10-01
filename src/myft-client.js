'use strict';

const MyftApi = require('./myft-api');
const session = require('next-session-client');

const lib = {
	personaliseUrl: require('./lib/personalise-url')
};

class MyFtClient {
	constructor (opts) {
		if (!opts.apiRoot) {
			throw 'User prefs must be constructed with an api root';
		}
		this.apiRoot = opts.apiRoot;
		this.loaded = {};
	}

	init (opts) {

		if (this.initialised) {
			return Promise.resolve();
		}
		return session.uuid()
			.then((user) => {

				this.userId = user.uuid;

				this.api = new MyftApi({
					apiRoot: this.apiRoot,
					headers: {
						'X-FT-Session-Token': session.cookie()
					}
				});

				if (opts.follow) {
					this.load('followed');
				}

				if (opts.saveForLater) {
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
			.getAllRelationship('user', this.userId, relationship)
			.then(results => {
				this.loaded[relationship] = results;
				this.emit(`${relationship}.load`, results);
			})
			.catch(err => {
				if (err.name === 'NoUserDataExists') {
					this.loaded[relationship] = {
						Count: 0,
						Items: [],
						ScannedCount: 0
					};
					this.emit(`${relationship}.load`, this.loaded[relationship]);
				} else {
					throw err;
				}
			});
	}

	add (relationship, subject, data) {
		this.api
			.updateRelationship('user', this.userId, relationship, subject, data)
			.then(results => {
				this.emit(`${relationship}.add`, {results, subject, data});
			});
	}

	remove (relationship, subject, data) {
		this.api
			.removeRelationship('user', this.userId, relationship, subject)
			.then(() => {
				this.emit(`${relationship}.remove`, {subject, data});
			});
	}

	get (relationship, subject) {
		return new Promise((resolve) => {
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
				return lib.personaliseUrl(url, uuid);
			});
	}
}

export default MyFtClient;
