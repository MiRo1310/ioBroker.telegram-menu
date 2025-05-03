"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const appUtilsString_1 = require("../../src/lib/appUtilsString");
describe('getPlaceholderValue', () => {
    it('should return "&&" if the text contains "&&"', () => {
        (0, chai_1.expect)((0, appUtilsString_1.getPlaceholderValue)('test && test')).to.equal('&&');
    });
    it('should return "&amp;&amp;" if the text contains "&amp;&amp;"', () => {
        (0, chai_1.expect)((0, appUtilsString_1.getPlaceholderValue)('test &amp;&amp; test')).to.equal('&amp;&amp;');
    });
    it('should return an empty string if the text contains neither "&&" nor "&amp;&amp;"', () => {
        (0, chai_1.expect)((0, appUtilsString_1.getPlaceholderValue)('test')).to.equal('');
    });
});
//# sourceMappingURL=appUtilsString.test.js.map