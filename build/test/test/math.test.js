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
    it('should get evaluate value', () => {
        const result = (0, math_1.evaluate)("2+2", adapter);
        (0, chai_1.expect)(result).to.deep.equal({ val: 4, error: false });
    });
    it('should return empty string if invalid eval string', () => {
        const result = (0, math_1.evaluate)("2+", adapter);
        (0, chai_1.expect)(result).to.deep.equal({ val: "", error: true });
    });
});
//# sourceMappingURL=math.test.js.map