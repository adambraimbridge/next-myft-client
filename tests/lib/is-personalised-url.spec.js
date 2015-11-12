/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';

const isPersonalisedUrl = require('../../src/lib/is-personalised-url');

const userId = '3f041222-22b9-4098-b4a6-7967e48fe4f7';
const listId = 'e077a74b-693f-4744-b055-d239f548f356';
const portfolioId = 'd8b9d552-da7f-4d31-845e-4b4d163ab8b4';

describe('identifying personalised URLs', () => {
	it('should identify between personalised urls and not personalised urls', () => {

		expect(isPersonalisedUrl(`/${userId}`)).to.be.true;
		expect(isPersonalisedUrl(`/my-news/${userId}`)).to.be.true;

		expect(isPersonalisedUrl(`/product-tour`)).to.be.false;
		expect(isPersonalisedUrl(`/my-news/`)).to.be.false;
		expect(isPersonalisedUrl(`/portfolio/`)).to.be.false;

	});

	it('should recognised that public lists are not personalised', () => {
		expect(isPersonalisedUrl(`/list/${listId}/`)).to.be.false;
	});

	it('should identify saved article lists are personalised or not', () => {
		expect(isPersonalisedUrl(`/saved-articles/list/${listId}`)).to.be.false;
		expect(isPersonalisedUrl(`/saved-articles/list/${listId}/`)).to.be.false;
		expect(isPersonalisedUrl(`/saved-articles/${userId}/list/${listId}`)).to.be.true;
		expect(isPersonalisedUrl(`/saved-articles/${userId}/list/${listId}/`)).to.be.true;

	});

	it('should identify portfolio detail pages are personalised or not', () => {
		// even though we're removing portfolio
		expect(isPersonalisedUrl(`/portfolio/detail/${portfolioId}/`)).to.be.false;
		expect(isPersonalisedUrl(`/portfolio/${userId}/detail/${portfolioId}/`)).to.be.true;
	})
});
