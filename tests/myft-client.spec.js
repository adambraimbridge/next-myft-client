/*global describe, it, expect, beforeEach, afterEach, xdescribe*/
/*jshint expr:true*/
'use strict';
require('isomorphic-fetch');

var sinon = require('sinon');

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
				return response;
			}
		});
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

	it('exits if erights absent fronm cookie', function() {
		document.cookie = 'FT_U=_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_SKEY=9999_RI=0_I=0_';
		var myFtClient = new MyFtClient({
			apiRoot: 'testRoot/'
		});
		myFtClient.init({
			follow: true,
			saveForLater: true,
			recommend: true
		});
		expect(mockFetch.called).to.not.be.true;
	});

	it('exits if sessionid absent fronm cookie', function() {
		document.cookie = 'FT_U=_EID=12324_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_RI=0_I=0_';
		var myFtClient = new MyFtClient({
			apiRoot: 'testRoot/'
		});
		myFtClient.init({
			follow: true,
			saveForLater: true,
			recommend: true
		});
		expect(mockFetch.called).to.not.be.true;
	});

});

describe('endpoints', function() {

	var fetchStub;
	var myFtClient;
	beforeEach(function() {
		document.cookie = 'FT_U=_EID=12324_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_SKEY=9999_RI=0_I=0_';
		fetchStub = sinon.stub(window, 'fetch');

		myFtClient = new MyFtClient({
			apiRoot: 'testRoot/'
		});
	});

	afterEach(function() {
		window.fetch.restore();
	});

	describe('follow', function () {

		beforeEach(function () {
			fetchStub.returns(mockFetch(fixtures.follow));
		});

		it('loads follow data from server', function(done) {
			myFtClient.init({
				follow: true
			});
			expect(fetchStub.calledWith('testRoot/activities/User:erights-12324/followed/Topic:')).to.be.true;
			document.addEventListener('myft.followed.load', function(evt) {
				expect(evt.detail.Count).to.equal(18);
				expect(evt.detail.Items[0].UUID = 'people:"Basic"');
				done();
			});
		});


		it('starts a notifications poller', function() {
			sinon.stub(Notifications.prototype, 'start');
			myFtClient.init({
				follow: true
			});
			expect(myFtClient.notifications instanceof Notifications).to.be.true;
			expect(Notifications.prototype.start.called).to.be.true;
			Notifications.prototype.start.restore();
		});

		it('can add a follow with stringified meta', function (done) {
			myFtClient.init();
			myFtClient.add('followed', 'topic:UUID WITH SPACES', {
				someKey: "blah"
			});

			expect(fetchStub.calledWith('testRoot/activities/User:erights-12324/followed/Topic:topic:UUID WITH SPACES')).to.be.true;
			expect(fetchStub.args[0][1].method).to.equal('PUT');
			expect(fetchStub.args[0][1].headers['X-FT-SESSION']).to.equal('9999');
			expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
			expect(fetchStub.args[0][1]['body']).to.equal('{"someKey":"blah"}');
			document.addEventListener('myft.followed.add', function(evt) {
				expect(evt.detail.subject).to.equal('topic:UUID WITH SPACES');
				done();
			});
		});

		it('can remove a follow', function (done) {
			myFtClient.init();
			myFtClient.remove('followed', 'topic:UUID WITH SPACES');

			expect(fetchStub.calledWith('testRoot/activities/User:erights-12324/followed/Topic:topic:UUID WITH SPACES')).to.be.true;
			expect(fetchStub.args[0][1].method).to.equal('DELETE');
			expect(fetchStub.args[0][1].headers['X-FT-SESSION']).to.equal('9999');
			expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
			document.addEventListener('myft.followed.remove', function(evt) {
				expect(evt.detail.subject).to.equal('topic:UUID WITH SPACES');
				done();
			});
		});
	});

	describe('save for later', function () {
		beforeEach(function () {
			fetchStub.returns(mockFetch(fixtures.forlater));
		});

		it('loads save for later data from server', function(done) {
			myFtClient.init({
				saveForLater: true
			});
			expect(fetchStub.calledWith('testRoot/activities/User:erights-12324/forlater/Article:')).to.be.true;
			document.addEventListener('myft.forlater.load', function(evt) {
				expect(evt.detail.Count).to.equal(33);
				expect(evt.detail.Items[0].UUID = '7be2ae5a-3aa0-11e4-bd08-00144feabdc0');
				done();
			});
		});


		it('can add a save for later with stringified meta', function (done) {
			myFtClient.init();
			myFtClient.add('forlater', '12345', {
				someKey: "blah"
			});

			expect(fetchStub.calledWith('testRoot/activities/User:erights-12324/forlater/Article:12345')).to.be.true;
			expect(fetchStub.args[0][1].method).to.equal('PUT');
			expect(fetchStub.args[0][1].headers['X-FT-SESSION']).to.equal('9999');
			expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
			expect(fetchStub.args[0][1]['body']).to.equal('{"someKey":"blah"}');
			document.addEventListener('myft.forlater.add', function(evt) {
				expect(evt.detail.subject).to.equal('12345');
				done();
			});
		});

		it('can remove a saveForLater', function (done) {
			myFtClient.init();
			myFtClient.remove('forlater', '12345');

			expect(fetchStub.calledWith('testRoot/activities/User:erights-12324/forlater/Article:12345')).to.be.true;
			expect(fetchStub.args[0][1].method).to.equal('DELETE');
			expect(fetchStub.args[0][1].headers['X-FT-SESSION']).to.equal('9999');
			expect(fetchStub.args[0][1].headers['Content-Type']).to.equal('application/json');
			document.addEventListener('myft.forlater.remove', function(evt) {
				expect(evt.detail.subject).to.equal('12345');
				done();
			});
		});
	});

	xdescribe('recommend', function () {});
});
