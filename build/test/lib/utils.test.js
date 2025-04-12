"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("../../src/lib/utils");
const utils_2 = require("../../src/lib/utils");
describe('Utils', () => {
    const mockData = [
        { name: 'Alice', chatID: '123' },
        { name: 'Bob', chatID: '456' },
        { name: 'Charlie', chatID: '789' },
    ];
    it('Should return the correct chatID, if user exist', () => {
        const result = (0, utils_1.getChatID)(mockData, 'Alice');
        (0, chai_1.expect)(result).to.equal('123');
    });
    it('Should return undefined, id no user exist', () => {
        const result = (0, utils_1.getChatID)(mockData, 'David');
        (0, chai_1.expect)(result).to.be.undefined;
    });
    it('Should return undefined, if the array is empty', () => {
        const result = (0, utils_1.getChatID)([], 'Alice');
        (0, chai_1.expect)(result).to.be.undefined;
    });
});
describe('isDefined', () => {
    it('should return true for defined values', () => {
        (0, chai_1.expect)((0, utils_2.isDefined)(123)).to.be.true;
        (0, chai_1.expect)((0, utils_2.isDefined)('test')).to.be.true;
        (0, chai_1.expect)((0, utils_2.isDefined)(true)).to.be.true;
        (0, chai_1.expect)((0, utils_2.isDefined)({})).to.be.true;
        (0, chai_1.expect)((0, utils_2.isDefined)([])).to.be.true;
    });
    it('should return false for undefined or null values', () => {
        (0, chai_1.expect)((0, utils_2.isDefined)(undefined)).to.be.false;
        (0, chai_1.expect)((0, utils_2.isDefined)(null)).to.be.false;
    });
});
//# sourceMappingURL=utils.test.js.map