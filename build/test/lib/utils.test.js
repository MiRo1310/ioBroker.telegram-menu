"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("../../src/lib/utils");
const setup_1 = require("../setup");
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
        (0, chai_1.expect)((0, utils_1.isDefined)(123)).to.be.true;
        (0, chai_1.expect)((0, utils_1.isDefined)('test')).to.be.true;
        (0, chai_1.expect)((0, utils_1.isDefined)(true)).to.be.true;
        (0, chai_1.expect)((0, utils_1.isDefined)({})).to.be.true;
        (0, chai_1.expect)((0, utils_1.isDefined)([])).to.be.true;
    });
    it('should return false for undefined or null values', () => {
        (0, chai_1.expect)((0, utils_1.isDefined)(undefined)).to.be.false;
        (0, chai_1.expect)((0, utils_1.isDefined)(null)).to.be.false;
    });
});
describe('deepCopy', () => {
    it('should create a deep copy of an object', () => {
        const original = { a: 1, b: { c: 2 } };
        const copy = (0, utils_1.deepCopy)(original);
        (0, chai_1.expect)(copy).to.deep.equal(original);
        (0, chai_1.expect)(copy).to.not.equal(original); // Ensure it's not the same reference
    });
    it('should return undefined for undefined or null input', () => {
        (0, chai_1.expect)((0, utils_1.deepCopy)(undefined)).to.be.undefined;
        (0, chai_1.expect)((0, utils_1.deepCopy)(null)).to.be.undefined;
    });
    it('should handle arrays correctly', () => {
        const original = [1, 2, { a: 3 }];
        const copy = (0, utils_1.deepCopy)(original);
        (0, chai_1.expect)(copy).to.deep.equal(original);
        (0, chai_1.expect)(copy).to.not.equal(original); // Ensure it's not the same reference
    });
    it('should return undefined for circular references', () => {
        const circular = {};
        circular.self = circular;
        const copy = (0, utils_1.deepCopy)(circular);
        (0, chai_1.expect)(copy).to.be.undefined; // JSON.stringify throws an error for circular references
    });
});
describe('checkDirectoryIsOk', () => {
    it('should return false and log an error if the directory is undefined', () => {
        const result = (0, utils_1.validateDirectory)(undefined);
        (0, chai_1.expect)(result).to.be.false;
        (0, chai_1.expect)(setup_1.adapter.log.error.called).to.be.true;
        (0, chai_1.expect)(setup_1.adapter.log.error.firstCall.args[0]).to.equal('No directory to save the picture. Please add a directory in the settings with full read and write permissions.');
    });
    it('should return false and log an error if the directory is an empty string', () => {
        const result = (0, utils_1.validateDirectory)('');
        (0, chai_1.expect)(result).to.be.false;
    });
    it('should return true if the directory is valid', () => {
        const result = (0, utils_1.validateDirectory)('/valid/directory');
        (0, chai_1.expect)(result).to.be.true;
        (0, chai_1.expect)(setup_1.adapter.log.error.called).to.be.false;
    });
});
//# sourceMappingURL=utils.test.js.map