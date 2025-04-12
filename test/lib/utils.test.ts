import { expect } from 'chai';
import { getChatID } from '../../src/lib/utils';
import type { UserListWithChatId } from '../../src/types/types';
import { isDefined } from '../../src/lib/utils';

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