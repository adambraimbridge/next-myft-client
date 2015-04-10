'use strict';

function Notifications(userPrefs) {
	this.userPrefs = userPrefs;
	this.previousResponse = null;
	this.notificationsUrl = 'events/User:erights-' + this.userPrefs.user.id() + '/articleFromFollow/getSinceDate/-48h';
}

Notifications.prototype.start = function () {
	this.poll();
	setInterval(this.poll.bind(this), 1000 * 30); // 30 second polling
}

Notifications.prototype.poll = function() {
	this.userPrefs.fetch('GET', this.notificationsUrl)
		.then(function(result) {
			var unseenItems = result.Items.filter(function (item) {
				return (item.Meta && !JSON.parse(item.Meta.S).seen);
			});

			var unseen = {
				'Items': unseenItems,
				'Count': unseenItems.length
			};

			this.userPrefs.emit('notifications:load', {
				all: result,
				unseen: unseen
			});

			if (this.previousResponse && this.previousResponse.Count !== result.Count) {
				var diff = result.Items.filter(function(newItem) {
					return !this.previousResponse.Items.some(function(oldItem) {
						return oldItem.UUID === newItem.UUID;
					});
				}, this);
				this.userPrefs.emit('notifications:new', diff);
			}
			this.previousResponse = result;
		}.bind(this));
};

Notifications.prototype.clear = function (uuid) {
	this.userPrefs.remove('articleFromFollow', uuid);
};

Notifications.prototype.seen = function (uuid) {
	this.userPrefs.add('articleFromFollow', uuid, {seen: 'mypage'});
};

module.exports = Notifications;
