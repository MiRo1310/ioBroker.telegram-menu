import { expect } from 'chai';
import { deleteDoubleEntriesInArray } from '../../src/lib/object';

describe('deleteDoubleEntriesInArray', () => {
    it('should remove duplicate entries from an array', () => {
        const input = ['a', 'b', 'a', 'c', 'b'];
        const expectedOutput = ['a', 'b', 'c'];
        expect(deleteDoubleEntriesInArray(input)).to.deep.equal(expectedOutput);
    });

    it('should return the same array if there are no duplicates', () => {
        const input = ['a', 'b', 'c'];
        const expectedOutput = ['a', 'b', 'c'];
        expect(deleteDoubleEntriesInArray(input)).to.deep.equal(expectedOutput);
    });

    it('should return an empty array if the input is empty', () => {
        const input: string[] = [];
        const expectedOutput: string[] = [];
        expect(deleteDoubleEntriesInArray(input)).to.deep.equal(expectedOutput);
    });

    it('should handle arrays with one element', () => {
        const input = ['a'];
        const expectedOutput = ['a'];
        expect(deleteDoubleEntriesInArray(input)).to.deep.equal(expectedOutput);
    });
});