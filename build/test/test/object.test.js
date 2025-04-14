"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const object_1 = require("../../src/lib/object");
describe('deleteDoubleEntriesInArray', () => {
    it('should remove duplicate entries from an array', () => {
        const input = ['a', 'b', 'a', 'c', 'b'];
        const expectedOutput = ['a', 'b', 'c'];
        (0, chai_1.expect)((0, object_1.removeDuplicates)(input)).to.deep.equal(expectedOutput);
    });
    it('should return the same array if there are no duplicates', () => {
        const input = ['a', 'b', 'c'];
        const expectedOutput = ['a', 'b', 'c'];
        (0, chai_1.expect)((0, object_1.removeDuplicates)(input)).to.deep.equal(expectedOutput);
    });
    it('should return an empty array if the input is empty', () => {
        const input = [];
        const expectedOutput = [];
        (0, chai_1.expect)((0, object_1.removeDuplicates)(input)).to.deep.equal(expectedOutput);
    });
    it('should handle arrays with one element', () => {
        const input = ['a'];
        const expectedOutput = ['a'];
        (0, chai_1.expect)((0, object_1.removeDuplicates)(input)).to.deep.equal(expectedOutput);
    });
});
describe('trimAllItems', () => {
    it('should trim whitespace from all items in the array', () => {
        const input = ['  a  ', '  b', 'c  '];
        const expectedOutput = ['a', 'b', 'c'];
        (0, chai_1.expect)((0, object_1.trimAllItems)(input)).to.deep.equal(expectedOutput);
    });
    it('should return an empty array if the input is empty', () => {
        const input = [];
        const expectedOutput = [];
        (0, chai_1.expect)((0, object_1.trimAllItems)(input)).to.deep.equal(expectedOutput);
    });
    it('should handle arrays with one element', () => {
        const input = ['  singleItem  '];
        const expectedOutput = ['singleItem'];
        (0, chai_1.expect)((0, object_1.trimAllItems)(input)).to.deep.equal(expectedOutput);
    });
    it('should not modify items that do not have whitespace', () => {
        const input = ['a', 'b', 'c'];
        const expectedOutput = ['a', 'b', 'c'];
        (0, chai_1.expect)((0, object_1.trimAllItems)(input)).to.deep.equal(expectedOutput);
    });
    it('should handle arrays with empty strings', () => {
        const input = ['  ', 'a', '  '];
        const expectedOutput = ['', 'a', ''];
        (0, chai_1.expect)((0, object_1.trimAllItems)(input)).to.deep.equal(expectedOutput);
    });
});
//# sourceMappingURL=object.test.js.map