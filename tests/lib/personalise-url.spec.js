/*global describe, it, expect, beforeEach, afterEach*/
/*jshint expr:true*/
'use strict';

const personaliseUrl = require('../../src/lib/personalise-url');

describe('url personalising', function () {
	it('should be possible to personalise a url', function (done) {

		const userId = 'f0bb6f11-c034-4792-a1c0-3647825363a0';
		const listId = 'e077a74b-693f-4744-b055-d239f548f356';
		const articleId = '08be4dcc-885f-11e5-90de-f44762bf9896';

		Promise.all([
			personaliseUrl(`/myft`, userId),
			personaliseUrl(`/myft/`, userId),
			personaliseUrl(`/myft/following`, userId),
			personaliseUrl(`/myft/following/`, userId),
			personaliseUrl(`/myft/following.json`, userId),
			personaliseUrl(`/myft/following?query=string`, userId),
			personaliseUrl(`/myft/saved-articles`, userId),
			personaliseUrl(`/myft/saved-articles/`, userId),
			personaliseUrl(`/myft/preferences`, userId),

			// immutable URLs
			personaliseUrl(`/myft/${userId}`, userId),
			personaliseUrl(`/myft/following/${userId}`, userId),
			personaliseUrl(`/myft/saved-articles/${userId}`, userId),
			personaliseUrl(`/myft/product-tour`, userId),
			personaliseUrl(`/myft/api/skdjfhksjd`, userId),
			// legacy+immutable URL
			personaliseUrl(`/myft/my-news`, userId),

			// a url with a non-user uuid in the query string
			personaliseUrl(`/myft/saved-articles?fragment=true&contentId=${articleId}`, userId),

			// a public list URL
			personaliseUrl(`/myft/list/${listId}`, userId),


		]).then(function (results) {
			expect(results.shift()).to.equal(`/myft/${userId}`);
			expect(results.shift()).to.equal(`/myft/${userId}`);
			expect(results.shift()).to.equal(`/myft/following/${userId}`);
			expect(results.shift()).to.equal(`/myft/following/${userId}`);
			expect(results.shift()).to.equal(`/myft/following/${userId}.json`);
			expect(results.shift()).to.equal(`/myft/following/${userId}?query=string`);
			expect(results.shift()).to.equal(`/myft/saved-articles/${userId}`);
			expect(results.shift()).to.equal(`/myft/saved-articles/${userId}`);
			expect(results.shift()).to.equal(`/myft/preferences/${userId}`);

			// immutable URLs
			expect(results.shift()).to.equal(`/myft/${userId}`);
			expect(results.shift()).to.equal(`/myft/following/${userId}`);
			expect(results.shift()).to.equal(`/myft/saved-articles/${userId}`);
			expect(results.shift()).to.equal(`/myft/product-tour`);
			expect(results.shift()).to.equal(`/myft/api/skdjfhksjd`);
			expect(results.shift()).to.equal(`/myft/my-news`);

			// a url with a non-user uuid in the query string
			expect(results.shift()).to.equal(`/myft/saved-articles/${userId}?fragment=true&contentId=${articleId}`);

			// a list URL (lists are public and contain no user ID)
			expect(results.shift()).to.equal(`/myft/list/${listId}`);

			done();

	}).catch(done);

	});
});
