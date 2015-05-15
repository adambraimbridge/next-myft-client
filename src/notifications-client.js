'use strict';

function Notifications(myFtClient) {
	if (!myFtClient) {
		throw 'a my ft client instance is required';
	}
	this.myFtClient = myFtClient;
	this.previousResponse = null;

}

Notifications.prototype.start = function () {
	this.notificationsUrl = 'events/' + this.myFtClient.userId + '/articleFromFollow/getSinceDate/-48h';
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

			var groupedData = {
				all: result,
				unseen: {
					Items: unseenItems,
					Count: unseenItems.length
				},
				'new': {
					Items: newItems,
					Count: newItems.length
				}
			};

			this.myFtClient.loaded.articleFromFollow = groupedData;
			this.myFtClient.emit('articleFromFollow.load', groupedData);

			this.previousResponse = result;
		}.bind(this));
};

Notifications.prototype.clear = function (ids, force) {
	ids.forEach(function (id) {
		var doIt = force || (this.myFtClient.loaded.articleFromFollow && this.myFtClient.loaded.articleFromFollow.all.Items.some(function (item) {
			return item.UUID === id;
		}));
		if (doIt) {
			this.myFtClient.remove('articleFromFollow', id);
		}
	}.bind(this));
};

Notifications.prototype.markAsSeen = function (ids) {
	ids.forEach(function (id) {
		if (!this.myFtClient.loaded.articleFromFollow || this.myFtClient.loaded.articleFromFollow.unseen.Items.some(function (item) {
			return item.UUID === id;
		})) {
			this.myFtClient.add('articleFromFollow', id, {status: 'seen'});
		}
	}.bind(this));
};

module.exports = Notifications;
