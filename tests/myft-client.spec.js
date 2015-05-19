/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';
require('isomorphic-fetch');

var sinon = require('sinon');
var session = require('next-session-client');
var MyFtClient = require('../src/myft-client');
var Notifications = require('../src/notifications-client');
var fixtures = {
	follow: require('./fixtures/follow.json'),
	forlater: require('./fixtures/forlater.json')
};

function mockFetch(response, status) {
	return new Promise(function(resolve, reject) {
		resolve({
			status: status || 200,
			json: function() {
				return Promise.resolve(response);
			}
		});
	});
}

function listenOnce(eventName, func) {
	document.addEventListener(eventName, function listener (ev) {
		func(ev);
		document.removeEventListener(eventName, listener);
	});
}

describe('Initialising', function() {

	var fetchStub;
	beforeEach(function() {
		fetchStub = sinon.stub(window, 'fetch');
		fetchStub.returns(mockFetch(fixtures.follow));
	});

	afterEach(function() {
		window.fetch.restore();
	});

	it('expecs an apiRoot', function() {
		expect(function () {
			new MyFtClient();
		}).to.throw;
	});

	it('in guid mode fetches a guid from the session', function(done) {
		document.cookie = 'FTSession=12345';
		sinon.stub(session, 'uuid', function () {
			return Promise.resolve({uuid:'abcd'});
		});
		var myFtClient = new MyFtClient({
			apiRoot: 'testRoot/'
		});
		myFtClient.init({
			follow: false,
			saveForLater: false,
			recommend: false,
			userPrefsGuid: true
		})
		.then(function () {
			expect(myFtClient.userId).to.equal('User:guid-abcd');
			expect(myFtClient.notifications).to.exist;
			session.uuid.restore();
			done();
		});

	});

	it('in guid mode exits if no or invalid guid', function(done) {
		document.cookie = 'FTSession=bad';
		sinon.stub(session, 'uuid', function () {
			return Promise.reject();
		});
		var myFtClient = new MyFtClient({
			apiRoot: 'testRoot/'
		});
		myFtClient.init({
			follow: false,
			saveForLater: false,
			recommend: false,
			userPrefsGuid: true
		})
		.catch(function () {
			expect(myFtClient.userId).not.to.exist;
			expect(myFtClient.notifications).to.exist;
			session.uuid.restore();
			done();
		});

	});


});


describe('endpoints', function() {

	var fetchStub;
	var myFtClient;
	beforeEach(function() {
		document.cookie = 'FT_U=_EID=12324_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_RI=0_I=0_';
		fetchStub = sinon.stub(window, 'fetch');
		sinon.stub(session, 'uuid', function () {
			return Promise.resolve({uuid:'abcd'});
		});
		myFtClient = new MyFtClient({
			apiRoot: 'testRoot/'
		});
	});

	afterEach(function() {
		window.fetch.restore();
		session.uuid.restore();
	});

	describe('follow', function () {

		beforeEach(function () {
			fetchStub.returns(mockFetch(fixtures.follow));
		});

		it('loads follow data from server', function(done) {
			myFtClient.init({
				userPrefsGuid: true,
				follow: true
			}).then(function () {
				expect(fetchStub.calledWith('testRoot/activities/User:guid-abcd/followed/Topic:')).to.be.true;
				listenOnce('myft.followed.load', function(evt) {
					expect(myFtClient.loaded.followed).to.exist;
					expect(evt.detail.Count).to.equal(18);
					expect(evt.detail.Items[0].UUID = 'people:"Basic"');
					done();
				});
			});
		});


		it('starts a notifications poller if user is following something', function(done) {
			sinon.stub(Notifications.prototype, 'start');
			myFtClient.init({
				userPrefsGuid: true,
				follow: true
			}).then(function () {
				expect(myFtClient.notifications instanceof Notifications).to.be.true;
				expect(Notifications.prototype.start.called).to.be.false;
				myFtClient.emit('followed.load', { Count: 0 });
				expect(Notifications.prototype.start.called).to.be.false;
				myFtClient.emit('followed.load', { Count: 1 });
				expect(Notifications.prototype.start.called).to.be.true;
				Notifications.prototype.start.restore();
				done();
			});
		});

		it('can add a follow with stringified meta', function (done) {
			myFtClient.init({
				userPrefsGuid: true
			}).then(function () {
				myFtClient.add('followed', 'topic:UUID WITH SPACES', {
					someKey: "blah"
				});
				expect(fetchStub.calledWith('testRoot/activities/User:guid-abcd/followed/Topic:topic:UUID WITH SPACES')).to.be.true;
				expect(fetchStub.args[0][1].method).to.equal('PUT');
				expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
				expect(fetchStub.args[0][1]['body']).to.equal('{"someKey":"blah"}');
				listenOnce('myft.followed.add', function(evt) {
					expect(evt.detail.subject).to.equal('topic:UUID WITH SPACES');
					done();
				});
			});
		});

		it('can remove a follow', function (done) {
			myFtClient.init({
				userPrefsGuid: true
			}).then(function () {
				myFtClient.remove('followed', 'topic:UUID WITH SPACES');

				expect(fetchStub.calledWith('testRoot/activities/User:guid-abcd/followed/Topic:topic:UUID WITH SPACES')).to.be.true;
				expect(fetchStub.args[0][1].method).to.equal('DELETE');
				expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
				listenOnce('myft.followed.remove', function(evt) {
					expect(evt.detail.subject).to.equal('topic:UUID WITH SPACES');
					done();
				});
			});
		});
	});

	describe('save for later', function () {
		beforeEach(function () {
			fetchStub.returns(mockFetch(fixtures.forlater));
		});

		it('loads save for later data from server', function(done) {
			myFtClient.init({
				userPrefsGuid: true,
				saveForLater: true
			}).then(function () {
				expect(fetchStub.calledWith('testRoot/activities/User:guid-abcd/forlater/Article:')).to.be.true;
				listenOnce('myft.forlater.load', function(evt) {
					expect(myFtClient.loaded.forlater).to.exist;
					expect(evt.detail.Count).to.equal(33);
					expect(evt.detail.Items[0].UUID = '7be2ae5a-3aa0-11e4-bd08-00144feabdc0');
					done();
				});
			});
		});


		it('can add a save for later with stringified meta', function (done) {
			myFtClient.init({
				userPrefsGuid: true
			}).then(function () {
				myFtClient.add('forlater', '12345', {
					someKey: "blah"
				});

				expect(fetchStub.calledWith('testRoot/activities/User:guid-abcd/forlater/Article:12345')).to.be.true;
				expect(fetchStub.args[0][1].method).to.equal('PUT');
				expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
				expect(fetchStub.args[0][1]['body']).to.equal('{"someKey":"blah"}');
				listenOnce('myft.forlater.add', function(evt) {
					expect(evt.detail.subject).to.equal('12345');
					done();
				});
			});
		});

		it('can remove a saveForLater', function (done) {
			myFtClient.init({
				userPrefsGuid: true
			}).then(function () {
				myFtClient.remove('forlater', '12345');

				expect(fetchStub.calledWith('testRoot/activities/User:guid-abcd/forlater/Article:12345')).to.be.true;
				expect(fetchStub.args[0][1].method).to.equal('DELETE');
				expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
				listenOnce('myft.forlater.remove', function(evt) {
					expect(evt.detail.subject).to.equal('12345');
					done();
				});
			});
		});
	});

});
