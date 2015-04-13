/*global describe, it, expect, beforeEach, afterEach, fetch*/
/*jshint expr:true*/
'use strict';

require('isomorphic-fetch');

var sinon = require('sinon');

var Notifications = require('../src/notifications-client');
var MyFt = require('../src/myft-client');

var fixtures = {
	notifications: require('./fixtures/notifications.json')
};

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
	var myFt;

	beforeEach(function() {
		document.cookie = 'FT_U=_EID=1234_PID';
		myFt = new MyFt({
			apiRoot: 'testroot/'
		});
		myFt.init();
		fetchStub = sinon.stub(window, 'fetch');
		fetchStub.returns(mockFetch(fixtures.notifications));
	});

	afterEach(function() {
		window.fetch.restore();
	});

	it('expect a my ft client instance', function() {
		expect(function () {
			new Notifications();
		}).to.throw;
	});

	it('don\'t start automatically', function() {
		new Notifications(myFt);
		expect(fetch.calledOnce).to.be.false;
	});


	it('polls for notifications data', function () {
		var clock = sinon.useFakeTimers();

		var n = new Notifications(myFt);
		n.start();
		expect(fetch.calledOnce).to.be.true;
		expect(fetch.args[0][0]).to.equal('testroot/events/User:erights-1234/articleFromFollow/getSinceDate/-48h');
		clock.tick(30001);
		expect(fetch.calledTwice).to.be.true;
		clock.restore();
	});

	it('event sent on notifications load', function(done) {
		new Notifications(myFt).start();
		document.body.addEventListener('notifications:load', function(evt){
			expect(evt.detail.all.Count).to.equal(2);
			expect(evt.detail.unseen.Count).to.equal(1);
			done();
		});
	});

	it('event sent on new notification load', function(done) {
		var n = new Notifications(myFt);
		n.previousResponse = {
			Count: 1,
			Items: [JSON.parse(JSON.stringify(fixtures.notifications.Items[0]))]
		};
		n.poll();
		document.body.addEventListener('notifications:new', function(evt) {
			expect(evt.detail.length).to.equal(1);
			done();
		});
	});

	//possible to clear

	//possible to mark as seen

});
