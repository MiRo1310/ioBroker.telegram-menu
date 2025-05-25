"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const exchangeValue_1 = require("../../src/lib/exchangeValue");
describe('isNoValueParameter', () => {
    it('should return insertValue as false and remove {novalue} from text', () => {
        const input = 'Test {novalue} string';
        const result = (0, exchangeValue_1.isNoValueParameter)(input);
        console.log(result);
        (0, chai_1.expect)(result.insertValue).to.be.false;
        (0, chai_1.expect)(result.textToSend).to.not.include('{novalue}');
    });
    it('should return insertValue as true if {novalue} is not present', () => {
        const input = 'Test string';
        const result = (0, exchangeValue_1.isNoValueParameter)(input);
        (0, chai_1.expect)(result.insertValue).to.be.true;
        (0, chai_1.expect)(result.textToSend).to.equal(input);
    });
});
//# sourceMappingURL=exchangeValue.test.js.map