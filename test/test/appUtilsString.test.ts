import { expect } from 'chai';
import { getPlaceholderValue } from '@b/lib/exchangeValue';

describe('getPlaceholderValue', () => {
    it('should return "&&" if the text contains "&&"', () => {
        expect(getPlaceholderValue('test && test')).to.equal('&&');
    });

    it('should return "&amp;&amp;" if the text contains "&amp;&amp;"', () => {
        expect(getPlaceholderValue('test &amp;&amp; test')).to.equal('&amp;&amp;');
    });

    it('should return an empty string if the text contains neither "&&" nor "&amp;&amp;"', () => {
        expect(getPlaceholderValue('test')).to.equal('');
    });
});
