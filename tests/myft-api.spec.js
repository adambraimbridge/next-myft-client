/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';
require('isomorphic-fetch');

const MyFtApi = require('../src/myft-api');
const myFtApi = new MyFtApi({
	apiRoot: 'https://test-api-route.com/',
	headers: {
		'X-API-KEY': 'adasd'
	}
});

const sinon = require('sinon');


function mockFetch(response, status) {
	return new Promise(function(resolve) {
		resolve({
			ok: true,
			status: status || 200,
			json: function() {
				return Promise.resolve(response);
			}
		});
	});
}


describe('url personalising', function () {

	it('should be possible to personalise a url', function () {

		const testUuid = 'abcd';

		expect(myFtApi.personaliseUrl('/myft', testUuid)).to.equal('/myft/abcd');
		expect(myFtApi.personaliseUrl('/myft/3f041222-22b9-4098-b4a6-7967e48fe4f7', testUuid)).to.equal('/myft/3f041222-22b9-4098-b4a6-7967e48fe4f7');
	});
});


describe('identifying personalised URLs', function () {
	it('should identify between personalised urls and not personalised urls', function () {
		expect(myFtApi.isPersonalisedUrl('/myft/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;
		expect(myFtApi.isPersonalisedUrl('/myft/my-news/')).to.be.false;
	})
});

describe('identifying immutable URLs', function () {
	it('should identify between immutable urls and mutable urls', function () {
		expect(myFtApi.isImmutableUrl('/myft/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;
		expect(myFtApi.isImmutableUrl('/myft/my-news/')).to.be.false;
	})
});

describe('getting a relationship', function() {
	let fetchStub;
	beforeEach(function() {
		fetchStub = sinon.stub(window, 'fetch');
		fetchStub.returns(mockFetch([]));
	});

	afterEach(function() {
		window.fetch.restore();
	});


	it('should request the API', function(done) {
		myFtApi.getAllRelationship('user', 'userId', 'followed').then(function() {
			expect(fetchStub.calledWith('https://test-api-route.com/user/userId/followed')).to.be.true;
			done();
		})
		.catch(done);

	});

	it('should accept pagination parameters', function(done) {
		myFtApi.getAllRelationship('user', 'userId', 'followed', {
			page: 2,
			limit: 10
		}).then(function() {
			expect(fetchStub.calledWith('https://test-api-route.com/user/userId/followed?page=2&limit=10')).to.be.true;
			done();
		}).catch(done);

	})
})