"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const math_1 = require("../../src/lib/math");
const testing_1 = require("@iobroker/testing");
const { adapter } = testing_1.utils.unit.createMocks({});
describe('evaluate', () => {
    it('should evaluate a valid mathematical expression', () => {
        const result = (0, math_1.evaluate)(['2', '+', '3'], adapter);
        (0, chai_1.expect)(result).to.deep.equal({ val: 5, error: false });
    });
    it('should return an error for invalid expressions', () => {
        const result = (0, math_1.evaluate)(['2', '+'], adapter);
        (0, chai_1.expect)(result).to.deep.equal({ val: '', error: true });
    });
    it('should handle empty input gracefully', () => {
        const result = (0, math_1.evaluate)([], adapter);
        (0, chai_1.expect)(result).to.deep.equal({ val: "", error: false });
    });
    it('should log an error when evaluation fails', () => {
        const result = (0, math_1.evaluate)(['invalid', 'expression'], adapter);
        (0, chai_1.expect)(result).to.deep.equal({ val: '', error: true });
    });
});
describe('calcValue', () => {
    it('should calculate a valid mathematical expression', () => {
        const textToSend = 'Test {math:+5}';
        const val = '10';
        const result = (0, math_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test',
            val: 15,
            error: false,
        });
    });
    it('should return the original text and value if the expression is invalid', () => {
        const textToSend = 'Test {math:+}';
        const val = '10';
        const result = (0, math_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test',
            val: '10',
            error: true,
        });
    });
    it('should handle empty input gracefully', () => {
        const textToSend = '';
        const val = '';
        const result = (0, math_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: '',
            val: '',
            error: false,
        });
    });
    it('should return the original text if no math expression is found', () => {
        const textToSend = 'No math here';
        const val = '10';
        const result = (0, math_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'No math here',
            val: 10,
            error: false,
        });
    });
    it('should handle complex expressions correctly', () => {
        const textToSend = 'Test {math:*2} test';
        const val = '5';
        const result = (0, math_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test  test',
            val: 10,
            error: false,
        });
    });
});
//# sourceMappingURL=math.test.js.map