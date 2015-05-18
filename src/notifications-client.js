'use strict';

function Notifications(myFtClient) {
	if (!myFtClient) {
		throw 'a my ft client instance is required';
	}
	this.myFtClient = myFtClient;
	this.notificationsUrl = 'events/User:erights-' + this.myFtClient.user.id() + '/articleFromFollow/getSinceDate/-168h?status=new';
}

Notifications.prototype.start = function () {
	this.poll();
	this.poller = setInterval(this.poll.bind(this), 1000 * 30); // 30 second polling
};

Notifications.prototype.stop = function () {
	this.poll();
	clearInterval(this.poller);
};

Notifications.prototype.poll = function() {
	this.myFtClient.fetch('GET', this.notificationsUrl)
		.then(function(result) {
			this.myFtClient.loaded.articleFromFollow = result;
			this.myFtClient.emit('articleFromFollow.load', result);
		}.bind(this));
};

Notifications.prototype.clear = function (ids, force) {
	ids.forEach(function (id) {
		var doIt = force || (this.myFtClient.loaded.articleFromFollow && this.myFtClient.loaded.articleFromFollow.Items.some(function (item) {
			return item.UUID === id;
		}));
		if (doIt) {
			this.myFtClient.remove('articleFromFollow', id);
		}
	}.bind(this));
};

Notifications.prototype.markAsSeen = function (ids) {
	ids.forEach(function (id) {
		this.myFtClient.add('articleFromFollow', id, {status: 'seen'});
	}.bind(this));
};

module.exports = Notifications;
