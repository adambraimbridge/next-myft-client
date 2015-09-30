/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';

var MyFtApi = require('../src/myft-api');

describe('url personalising', function () {
	it('should be possible to personalise a url', function () {

		var testUuid = 'abcd';

		expect(MyFtApi.personaliseUrl('/myft', testUuid)).to.equal('/myft/abcd');
		expect(MyFtApi.personaliseUrl('/myft/3f041222-22b9-4098-b4a6-7967e48fe4f7', testUuid)).to.equal('/myft/3f041222-22b9-4098-b4a6-7967e48fe4f7');
	});
});
