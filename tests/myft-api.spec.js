/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';
const MyFtApi = require('../src/myft-api');

const myFtApi = new MyFtApi({
	apiRoot: 'https://test-api-route.com',
	headers: {
		'X-API-KEY': 'adasd'
	}
});

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
