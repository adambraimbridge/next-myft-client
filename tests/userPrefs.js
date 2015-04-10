/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';

var sinon = require('sinon');

var UserPrefs = require('../src/lib/UserPrefs');

var fixtures = {
	favourites: JSON.parse(requireText('./fixtures/favourites.json'))
};

require('isomorphic-fetch');

var emit = function(name, data) {
	var event = document.createEvent('Event');
	event.initEvent(name, true, true);
	if (data) {
		event.detail = data;
	}
	document.dispatchEvent(event);
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

describe('Initialising User Prefs', function() {

	var fetchStub;
	beforeEach(function() {
		fetchStub = sinon.stub(window, 'fetch');
		fetchStub.returns(mockFetch(fixtures.favourites));
	});

	afterEach(function() {
		window.fetch.restore();
	});

	it('picks up User data from cookies', function() {
		document.cookie = "FT_U=_EID=12324_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_SKEY=9999_RI=0_I=0_";
		var userPrefs = new UserPrefs();
		expect(userPrefs.eRights).to.equal('12324');
		expect(userPrefs.session).to.equal('9999');
	});

});


describe('Favourites', function() {

	var fetchStub;
	var userPrefs;
	beforeEach(function() {
		document.cookie = "FT_U=_EID=12324_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_SKEY=9999_RI=0_I=0_";
		UserPrefs.setRoot('testRoot/');
		fetchStub = sinon.stub(window, 'fetch');
		fetchStub.returns(mockFetch(fixtures.favourites));
	});

	afterEach(function() {
		window.fetch.restore();
	});


	it('does not work without an eRights ID', function() {
		document.cookie = 'FT_U=null';
		userPrefs = new UserPrefs();
		userPrefs.init();
		expect(fetchStub.callCount).to.equal(0);

	});

	it('loads favourite data from server', function(done) {
		userPrefs = new UserPrefs();
		userPrefs.init();
		expect(fetchStub.calledWith('testRoot/User:erights-12324/followed/Topic:')).to.be.true;
		document.addEventListener('favourites:load', function(evt) {
			expect(evt.detail.Count).to.equal(18);
			expect(evt.detail.Items[0].UUID = 'people:\"Basic\"');
			done();
		});
	});

	it('can add a favourite with stringified meta', function() {
		userPrefs = new UserPrefs();
		userPrefs.init();
		emit('favourites:add', {
			uuid: "topic:UUID WITH SPACES",
			meta: {
				someKey: "blah"
			}
		});

		expect(fetchStub.calledWith('testRoot/User:erights-12324/followed/Topic:topic:UUID WITH SPACES')).to.be.true;
		expect(fetchStub.args[3][1].method).to.equal('PUT');
		expect(fetchStub.args[3][1].headers['X-FT-SESSION']).to.equal('9999');
		expect(fetchStub.args[3][1].headers['Content-Type']).to.equal('application/json');
		expect(fetchStub.args[3][1]['body']).to.equal('{"someKey":"blah"}');
	});
});
