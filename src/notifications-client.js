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
			if (!result) {
				return;
			}
			var newItems;
			var unseenItems = result.Items.filter(function (item) {
				return (item.Status && item.Status.S !== 'seen');
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

			this.myFtClient.emit('articleFromFollow.load', {
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

			this.myFtClient.emitBeaconEvent('notifications.unseen', unseenItems.length);
			this.myFtClient.emitBeaconEvent('notifications.new', newItems.length);

			this.previousResponse = result;
		}.bind(this))
		.catch(function (err) {
			setTimeout(function () {
				throw err
			});
		});
};

Notifications.prototype.clear = function (ids) {
	ids.forEach(function (id) {
		this.myFtClient.remove('articleFromFollow', id);
	}.bind(this));
};

Notifications.prototype.markAsSeen = function (ids) {
	ids.forEach(function (id) {
		this.myFtClient.add('articleFromFollow', id, {status: 'seen'});
	}.bind(this));

};

module.exports = Notifications;
