"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const time_1 = require("../../src/lib/time");
const config_1 = require("../../src/config/config");
describe('Time', () => {
    const testDate = new Date(1744388803096);
    const expectedDate = '11.4.2025, 18:26:43';
    it('Should return a correct formatted date', () => {
        const result = (0, time_1.toLocaleDate)(testDate);
        (0, chai_1.expect)(result).to.equal(expectedDate);
    });
    it('Should not throw an exception, if no valid date', () => {
        const invalidDate = new Date('invalid-date');
        (0, chai_1.expect)(() => (0, time_1.toLocaleDate)(invalidDate)).to.not.throw();
    });
    it("Integrate a valid time into text", () => {
        const result = (0, time_1.integrateTimeIntoText)(`Test at ${config_1.config.replacer.time} created`, 1744388803096);
        (0, chai_1.expect)(result).to.equal(`Test at ${expectedDate} created`);
    });
    it("Handle a non valid time", () => {
        const result = (0, time_1.integrateTimeIntoText)(`Test at ${config_1.config.replacer.time} created`, "abc");
        (0, chai_1.expect)(result).to.equal(`Test at "Invalid Date" created`);
    });
    it("Handle a null value for time", () => {
        [null, undefined].forEach((value) => {
            const result = (0, time_1.integrateTimeIntoText)(`Test at ${config_1.config.replacer.time} created`, value);
            (0, chai_1.expect)(result).to.equal(`Test at "Invalid Date" created`);
        });
    });
});
//# sourceMappingURL=time.test.js.map