import {expect} from 'chai';
import {removeDuplicates, trimAllItems} from '../../src/lib/object';

describe('deleteDoubleEntriesInArray', () => {
    it('should remove duplicate entries from an array', () => {
        const input = ['a', 'b', 'a', 'c', 'b'];
        const expectedOutput = ['a', 'b', 'c'];
        expect(removeDuplicates(input)).to.deep.equal(expectedOutput);
    });

    it('should return the same array if there are no duplicates', () => {
        const input = ['a', 'b', 'c'];
        const expectedOutput = ['a', 'b', 'c'];
        expect(removeDuplicates(input)).to.deep.equal(expectedOutput);
    });

    it('should return an empty array if the input is empty', () => {
        const input: string[] = [];
        const expectedOutput: string[] = [];
        expect(removeDuplicates(input)).to.deep.equal(expectedOutput);
    });

    it('should handle arrays with one element', () => {
        const input = ['a'];
        const expectedOutput = ['a'];
        expect(removeDuplicates(input)).to.deep.equal(expectedOutput);
    });
});

describe('trimAllItems', () => {
    it('should trim whitespace from all items in the array', () => {
        const input = ['  a  ', '  b', 'c  '];
        const expectedOutput = ['a', 'b', 'c'];
        expect(trimAllItems(input)).to.deep.equal(expectedOutput);
    });

    it('should return an empty array if the input is empty', () => {
        const input: string[] = [];
        const expectedOutput: string[] = [];
        expect(trimAllItems(input)).to.deep.equal(expectedOutput);
    });

    it('should handle arrays with one element', () => {
        const input = ['  singleItem  '];
        const expectedOutput = ['singleItem'];
        expect(trimAllItems(input)).to.deep.equal(expectedOutput);
    });

    it('should not modify items that do not have whitespace', () => {
        const input = ['a', 'b', 'c'];
        const expectedOutput = ['a', 'b', 'c'];
        expect(trimAllItems(input)).to.deep.equal(expectedOutput);
    });

    it('should handle arrays with empty strings', () => {
        const input = ['  ', 'a', '  '];
        const expectedOutput = ['', 'a', ''];
        expect(trimAllItems(input)).to.deep.equal(expectedOutput);
    });
});