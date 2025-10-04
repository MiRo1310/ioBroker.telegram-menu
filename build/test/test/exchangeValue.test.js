"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const exchangeValue_1 = require("../../src/lib/exchangeValue");
describe('isNoValueParameter', () => {
    it('soll insertValue true zurückgeben, wenn kein {novalue} enthalten ist', () => {
        const result = (0, exchangeValue_1.isNoValueParameter)('Testtext');
        (0, chai_1.expect)(result.insertValue).to.be.true;
        (0, chai_1.expect)(result.textToSend).to.equal('Testtext');
    });
    it('soll insertValue false zurückgeben und {novalue} entfernen', () => {
        const result = (0, exchangeValue_1.isNoValueParameter)('Text mit {novalue} drin');
        (0, chai_1.expect)(result.insertValue).to.be.false;
        (0, chai_1.expect)(result.textToSend).to.equal('Text mit drin');
    });
});
//# sourceMappingURL=exchangeValue.test.js.map