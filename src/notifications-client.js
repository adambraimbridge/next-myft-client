'use strict';

function Notifications(myFtClient) {
	if (!myFtClient) {
		throw 'a my ft client instance is required';
	}
	this.myFtClient = myFtClient;
	this.previousResponse = null;
	this.notificationsUrl = 'events/User:erights-' + this.myFtClient.user.id() + '/articleFromFollow/getSinceDate/-48h';
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

			var newItems;
			var unseenItems = result.Items.filter(function (item) {
				return (item.Meta && !JSON.parse(item.Meta.S).seen);
			});

			if (this.previousResponse && this.previousResponse.Count !== result.Count) {
				newItems = result.Items.filter(function(newItem) {
					return !this.previousResponse.Items.some(function(oldItem) {
						return oldItem.UUID === newItem.UUID;
					});
				}, this);
			} else {
				newItems = [];
			}

			this.myFtClient.emit('notifications.load', {
				all: result,
				unseen: {
					Items: unseenItems,
					Count: unseenItems.length
				},
				'new': {
					Items: newItems,
					Count: newItems.length
				}
			});
			this.previousResponse = result;
		}.bind(this));
};

Notifications.prototype.clear = function (ids) {
	ids.forEach(function (id) {
		this.myFtClient.remove('articleFromFollow', id);
	}.bind(this));
};

Notifications.prototype.markAsSeen = function (ids) {
	ids.forEach(function (id) {
		this.myFtClient.add('articleFromFollow', id, {seen: 'mypage'});
	}.bind(this));

};

module.exports = Notifications;
