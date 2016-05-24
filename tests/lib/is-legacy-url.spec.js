import chai from 'chai';
const expect = chai.expect;
const isLegacyUrl = require('../../src/lib/is-legacy-url');

describe('identifying legacy URLs', () => {
	it('should identify between legacy urls and current urls', () => {

		expect(isLegacyUrl('/myft/my-news')).to.equal(true);
		expect(isLegacyUrl('/myft/following/')).to.equal(false);

	});
});
