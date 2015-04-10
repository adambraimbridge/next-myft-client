/*global describe, it, expect, beforeEach, afterEach, fetch*/
/*jshint expr:true*/
'use strict';

var sinon = require('sinon');

var NotificationPoller = require('../src/lib/NotificationPoller');

var fixtures = {
	notification: JSON.parse(requireText('./fixtures/notification.json'))
};

require('isomorphic-fetch');


function mockFetch(response, status) {
	return new Promise(function(resolve, reject) {
		resolve({
			status: status || 200,
			json: function() {
				return response;
			}
		});
	});
}

describe('Notification Polling', function() {

	var fetchStub;
	beforeEach(function() {
		fetchStub = sinon.stub(window, 'fetch');
		fetchStub.returns(mockFetch(fixtures.notification));
	});

	afterEach(function() {
		window.fetch.restore();
	});

	it('Notifications do not poll if there is no user id', function() {
		document.cookie = "FT_U=null";
		new NotificationPoller();
		expect(fetch.calledOnce).to.be.false;
	});


	it('Notifications do poll if there is a user id', function() {
		document.cookie = "FT_U=_EID=1234_PID";
		new NotificationPoller('/__user-prefs/');
		expect(fetch.args[0][0]).to.equal('/__user-prefs/User:erights-1234/activitiesSince/-48h?verb=notified_of');
	});

	it('Event sent on notification load', function(done) {
		document.cookie = "FT_U=_EID=12324_PID";
		new NotificationPoller();
		expect(fetchStub.calledOnce).to.be.true;

		document.addEventListener('notifications:load', function(evt){
			expect(evt.detail.all.Count).to.equal(1);
			expect(evt.detail.unseen.Count).to.equal(0);
			done();
		});
	});
});
