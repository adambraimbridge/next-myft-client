/*global expect*/
'use strict';

const isImmutableUrl = require('../../src/lib/is-immutable-url');

describe('identifying immutable URLs', () => {
	it('should identify between immutable urls and mutable urls', () => {

		expect(isImmutableUrl('/myft/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;
		expect(isImmutableUrl('/myft/following/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;
		expect(isImmutableUrl('/myft/saved-articles/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;
		expect(isImmutableUrl('/myft/product-tour')).to.be.true;

		expect(isImmutableUrl('/myft/following/')).to.be.false;
		expect(isImmutableUrl('/myft/saved-articles/')).to.be.false;

		expect(isImmutableUrl('/myft/list/e077a74b-693f-4744-b055-d239f548f356/')).to.be.true;

		expect(isImmutableUrl('/list/e077a74b-693f-4744-b055-d239f548f356')).to.be.true;
		expect(isImmutableUrl('/lists/3f041222-22b9-4098-b4a6-7967e48fe4f7')).to.be.true;

		//Legacy URLs
		expect(isImmutableUrl('/myft/my-news/')).to.be.true;
		expect(isImmutableUrl('/myft/my-topics/')).to.be.true;
		expect(isImmutableUrl('/myft/preferences/')).to.be.true;
	})
});
