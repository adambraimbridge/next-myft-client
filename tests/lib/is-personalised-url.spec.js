import chai from 'chai';
const expect = chai.expect;
const isPersonalisedUrl = require('../../src/lib/is-personalised-url');

const userId = '3f041222-22b9-4098-b4a6-7967e48fe4f7';
const listId = 'e077a74b-693f-4744-b055-d239f548f356';

describe('identifying personalised URLs', () => {
	it('should identify between personalised urls and not personalised urls', () => {

		expect(isPersonalisedUrl(`/${userId}`)).to.be.true;
		expect(isPersonalisedUrl(`/following/${userId}`)).to.be.true;

		expect(isPersonalisedUrl('/product-tour')).to.be.false;
		expect(isPersonalisedUrl('/following/')).to.be.false;

	});

	it('should identify lists urls as personal', () => {
		expect(isPersonalisedUrl(`/list/${listId}`)).to.be.true;
	});
});
