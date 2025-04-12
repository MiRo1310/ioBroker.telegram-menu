import {expect} from 'chai';
import {deepCopy, getChatID, isDefined} from '../../src/lib/utils';
import type {UserListWithChatId} from '../../src/types/types';
import {adapter} from "../setup";

describe('Utils', () => {
    const mockData: UserListWithChatId[] = [
        { name: 'Alice', chatID: '123' },
        { name: 'Bob', chatID: '456' },
        { name: 'Charlie', chatID: '789' },
    ];

    it('Should return the correct chatID, if user exist', () => {
        const result = getChatID(mockData, 'Alice');
        expect(result).to.equal('123');
    });

    it('Should return undefined, id no user exist', () => {
        const result = getChatID(mockData, 'David');
        expect(result).to.be.undefined;
    });

    it('Should return undefined, if the array is empty', () => {
        const result = getChatID([], 'Alice');
        expect(result).to.be.undefined;
    });
});

describe('isDefined', () => {
    it('should return true for defined values', () => {
        expect(isDefined(123)).to.be.true;
        expect(isDefined('test')).to.be.true;
        expect(isDefined(true)).to.be.true;
        expect(isDefined({})).to.be.true;
        expect(isDefined([])).to.be.true;
    });

    it('should return false for undefined or null values', () => {
        expect(isDefined(undefined)).to.be.false;
        expect(isDefined(null)).to.be.false;
    });
});

describe('deepCopy', () => {
    it('should create a deep copy of an object', () => {
        const original = { a: 1, b: { c: 2 } };
        const copy = deepCopy(original);

        expect(copy).to.deep.equal(original);
        expect(copy).to.not.equal(original); // Ensure it's not the same reference
    });

    it('should return undefined for undefined or null input', () => {
        expect(deepCopy(undefined)).to.be.undefined;
        expect(deepCopy(null)).to.be.undefined;
    });

    it('should handle arrays correctly', () => {
        const original = [1, 2, { a: 3 }];
        const copy = deepCopy(original);

        expect(copy).to.deep.equal(original);
        expect(copy).to.not.equal(original); // Ensure it's not the same reference
    });

    it('should return undefined for circular references', () => {
        const circular: any = {};
        circular.self = circular;

        const copy = deepCopy(circular);
        expect(copy).to.be.undefined; // JSON.stringify throws an error for circular references
    });
});