/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';

var isPersonalisedUrl = require('../../src/lib/is-personalised-url');


describe('identifying personalised URLs', function () {
	it('should identify between personalised urls and not personalised urls', function () {

		expect(isPersonalisedUrl('/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;
		expect(isPersonalisedUrl('/my-news/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;

		expect(isPersonalisedUrl('/product-tour')).to.be.false;
		expect(isPersonalisedUrl('/my-news/')).to.be.false;
		expect(isPersonalisedUrl('/portfolio/')).to.be.false;

		expect(isPersonalisedUrl('/list/e077a74b-693f-4744-b055-d239f548f356/')).to.be.false;
		// ...

	})
});
