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
			apiRoot: 'testRoot/'
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


	it('polls for notifications data', function (done) {
		var clock = sinon.useFakeTimers();
		var n = new Notifications(myFt);
		n.start();
		expect(fetch.calledOnce).to.be.true;
		expect(fetch.args[0][0]).to.equal('testRoot/events/User:erights-1234/articleFromFollow/getSinceDate/-48h');
		clock.tick(30001);
		expect(fetch.calledTwice).to.be.true;
		n.stop();
		clock.restore();
		document.body.addEventListener('myft.notifications.load', function(ev) {
			done();
		});
	});

	it('event sent on notifications load', function(done) {
		var clock = sinon.useFakeTimers();
		var n = new Notifications(myFt);
		n.previousResponse = {
			Count: 1,
			Items: [JSON.parse(JSON.stringify(fixtures.notifications.Items[0]))]
		};
		n.poll();
		document.body.addEventListener('myft.notifications.load', function(ev) {
			expect(ev.detail.all.Count).to.equal(2);
			expect(ev.detail.unseen.Count).to.equal(1);
			expect(ev.detail['new'].Count).to.equal(1);
			clock.restore();
			done();
		});
	});

	it('possible to clear one or more notifications', function (done) {
		var n = new Notifications(myFt);
		n.clear(['12345', '678910']);
		expect(fetchStub.calledWith('testRoot/events/User:erights-1234/articleFromFollow/Article:12345')).to.be.true;
		expect(fetchStub.calledWith('testRoot/events/User:erights-1234/articleFromFollow/Article:678910')).to.be.true;
		expect(fetchStub.args[0][1].method).to.equal('DELETE');
		document.addEventListener('myft.articleFromFollow.remove', function(ev) {
			expect(ev.detail.subject).to.equal('12345');
			done();
		});
	});

	it('possible to mark one or more notifications as seen', function (done) {
		var n = new Notifications(myFt);
		n.markAsSeen(['12345', '678910']);
		expect(fetchStub.calledWith('testRoot/events/User:erights-1234/articleFromFollow/Article:12345')).to.be.true;
		expect(fetchStub.calledWith('testRoot/events/User:erights-1234/articleFromFollow/Article:678910')).to.be.true;
		expect(fetchStub.args[0][1].method).to.equal('PUT');
		expect(fetchStub.args[0][1]['body']).to.equal('{"seen":"mypage"}');
		document.addEventListener('myft.articleFromFollow.add', function(ev) {
			expect(ev.detail.subject).to.equal('12345');
			done();
		});
	});

});
