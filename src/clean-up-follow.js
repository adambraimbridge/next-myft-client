'use strict';



function eventToPromise (ev) {
	return new Promise(function(resolve, reject) {
			document.body.addEventListener(ev, function listener (ev) {
				document.body.removeEventListener(ev, listener);
				resolve(ev.detail);
			});
		})
}

module.exports = function (myFtClient) {
	Promise.all([
		eventToPromise('myft.followed.load'),
		eventToPromise('myft.articleFromFollow.load')
	])
		.then(function (res) {
			var followed = res[0].Items.map(function (topic) {
				return topic.UUID;
			})
			var sources = {};

			res[1].all.Items.forEach(function (notification) {
				notification.SourcesList.SS.forEach(function (topic) {
					sources[topic] = true;
				})
			});

			sources = Object.keys(sources);

			sources.forEach(function (source) {
				if (followed.indexOf(source) === -1) {
					myFtClient.remove('followed', encodeURIComponent(source));
				}
			});
		})
		.catch(function (err) {
			console.log(err);
		});
};
