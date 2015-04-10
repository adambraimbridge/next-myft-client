'use strict';

var NotificationPoller = require('./NotificationPoller');
var User = require('next-user-model-component');

var initialised;

var transformDynamoItem = function (item) {
	Object.keys(item).forEach(function (key) {
		item[key] = item[key].S || item[key];
		if (key === 'Meta') {
			item[key] = JSON.parse(item[key]);
		}
	});
}

var subjectPrefixes = {
	followed: 'Topic',
	recommended: 'Article',
	forlater: 'Article',
	notified: 'Article'
}

var verbCategories = {
	followed: 'activities',
	recommended: 'activities',
	forlater: 'activities',
	notified: 'events'
}

var UserPrefs = function (opts) {
	if (!opts || !opts.apiRoot) {
		throw 'User prefs must be constructed with an api root';
	}
	this.apiRoot = opts.apiRoot;
};

UserPrefs.prototype.init = function (opts) {

	if (!this.initialised) {
		this.initialised = true;

		this.user = new User(document.cookie);

		if (!this.user.id()) {
			return console.warn('No eRights ID found in your cookie.');
		}

		if (!this.user.session()) {
			return console.warn('No session ID found in your cookie.');
		}

		this.headers = {
			'Content-Type': 'application/json',
			'X-FT-SESSION': this.user.session()
		};

		opts = opts || {};
		this.notifications = new Notifications(this);
		if (opts.follow) {
			this.notifications.start();
			this.load('followed');
		}

		if (opts.saveForLater) {
			this.load('forlater');
		}
		if (opts.recommend) {
			this.load('recommended');
		}
	}
};


UserPrefs.prototype.emit = function(name, data) {
	var event = document.createEvent('Event');
	event.initEvent(name, true, true);
	if (data) {
		event.detail = data;
	}
	document.body.dispatchEvent(event);
};


UserPrefs.prototype.fetch = function (method, endpoint, meta) {

	var options = {
		method: method,
		headers: this.headers
	};

	if (method !== 'GET') {
		options.body = (meta) ? JSON.stringify(meta) : '';
	}

	return fetch(this.apiRoot + endpoint, options)
	.then(function(response) {
		if (response.status >= 400 && response.status < 600) {
			setTimeout(function () {
				throw new Error("Network error loading user prefs for user", this.user.id());
			}.bind(this), 0)
		} else {
			return response.json();
		}
	}.bind(this));

};

UserPrefs.prototype.load = function (verb) {
	this.fetch('GET', verbCategories[verb] + '/User:erights-' + this.user.id() + '/' + verb + '/' + subjectPrefixes[verb])
		.then(function (results) {
			// results.forEach(transformDynamoItem);
			this.emit(verb + ':load', results);
		}.bind(this));
}

UserPrefs.prototype.add = function (verb, subject, meta) {
	this.fetch('PUT', verbCategories[verb] + '/User:erights-' + this.user.id() + '/' + verb + '/' + subjectPrefixes[verb] + subject, meta)
		.then(function (result) {
			this.emit(verb + ':add', result);
		}.bind(this));
}

UserPrefs.prototype.remove = function (verb, subject) {
	this.fetch('DELETE', verbCategories[verb] + '/User:erights-' + this.user.id() + '/' + verb + '/' + subjectPrefixes[verb] + subject);
		.then(function (result) {
			this.emit(verb + ':remove', {
				subject: subject
			});
		}.bind(this));
}

module.exports = UserPrefs;
