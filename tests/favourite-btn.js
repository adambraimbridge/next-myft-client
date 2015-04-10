/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';

var favourite = require('../src/lib/favourite/main');
var sinon = require('sinon');

var emit = function(name, data) {
	var event = document.createEvent('Event');
	event.initEvent(name, true, true);
	if (data) {
		event.detail = data;
	}
	document.dispatchEvent(event);
};

function createFollowButton(conceptId) {
	var btn = document.createElement('button');
	btn.setAttribute('data-user-prefs-button', 'follow');
	btn.setAttribute('data-concept-id', conceptId);
	document.body.appendChild(btn);
	return btn;
}

function removeAllButtons(){
	var buttons = document.querySelectorAll('[data-user-prefs-button]');
	if(buttons && buttons.length) {
		[].slice.call(buttons).forEach(function(btn) {
			btn.parentElement.removeChild(btn);
		});
	}
}

function mockLoad(conceptIds) {
	emit('favourites:load', {
		Count: conceptIds.length,
		Items: conceptIds.map(function(id) {
			return {
				"Relationship": {
					"S": "http:\/\/ft-next-api-user-prefs-v002.herokuapp.com\/Topic:" + id
				},
				"Meta": {
					"S": "{}"
				},
				"ActivityId": {
					"S": "bd25636f-7519-49db-8756-e7d67b61b8bb"
				},
				"Created": {
					"S": "2015-02-25T13:39:28.003Z"
				},
				"Owner": {
					"S": "http:\/\/ft-next-api-user-prefs-v002.herokuapp.com\/User:erights-12324"
				},
				"Self": "http:\/\/ft-next-api-user-prefs-v002.herokuapp.com\/User:erights-12324\/followed\/Topic:people:\"Malcolm%20Rifkind\"",
				"UUID": id
			};
		})
	});
}

describe('Setting initial state', function() {

	beforeEach(function() {
		document.cookie = "FT_U=_EID=12324_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_SKEY=9999_RI=0_I=0_";
		removeAllButtons();
	});

	afterEach(function() {
		removeAllButtons();
	});

	it('sets the pressed state for concepts that are already followed', function(done) {
		var followed = createFollowButton('people:"Basic"');
		var notFollowed = createFollowButton('people:"NotFollowed"');
		favourite.init();
		document.addEventListener('favourites:load', function(evt) {
			expect(followed.hasAttribute('aria-pressed')).to.be.true;
			expect(notFollowed.hasAttribute('aria-pressed')).to.be.false;
			done();
		});

		mockLoad(['people:"Basic"']);
	});

	it('only matches buttons with the same encoding as what is returned by server', function(done) {
		var encodedFollowed = createFollowButton('sections:"UK%20Business"');
		var doubleEncoded = createFollowButton('sections%3A%22UK%2520Business%22');
		favourite.init();
		document.addEventListener('favourites:load', function(evt) {
			expect(encodedFollowed.hasAttribute('aria-pressed')).to.be.true;
			expect(doubleEncoded.hasAttribute('aria-pressed')).to.be.false;
			done();
		});

		mockLoad(['sections:"UK%20Business"']);
	});

});

describe('clicking the button', function() {

	beforeEach(function() {
		document.cookie = "FT_U=_EID=12324_PID=4011101642_TIME=%5BWed%2C+04-Mar-2015+11%3A49%3A49+GMT%5D_SKEY=9999_RI=0_I=0_";
		removeAllButtons();
	});

	afterEach(function() {
		removeAllButtons();
	});

	it('follows a concept and sends encoded string to server', function() {
		var notFollowed = createFollowButton('people:"Not%20Followed"');
		var dispatchSpy = sinon.spy(document, 'dispatchEvent');

		favourite.init();
		expect(notFollowed.hasAttribute('aria-pressed')).to.be.false;
		notFollowed.click();
		expect(notFollowed.hasAttribute('aria-pressed')).to.be.true;
		expect(dispatchSpy.getCall(0).args[0].type).to.equal('favourites:add');
		expect(dispatchSpy.getCall(0).args[0].detail.uuid).to.equal('people%3A%22Not%2520Followed%22');

		notFollowed.click();
		expect(notFollowed.hasAttribute('aria-pressed')).to.be.false;
		expect(dispatchSpy.getCall(1).args[0].type).to.equal('favourites:remove');
		expect(dispatchSpy.getCall(1).args[0].detail.uuid).to.equal('people%3A%22Not%2520Followed%22');


		document.dispatchEvent.restore();
	});

});
