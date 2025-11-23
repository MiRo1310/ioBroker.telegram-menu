import { expect } from 'chai';
import { deepCopy, getChatID, isDefined, isFalsy, isTruthy, validateDirectory } from '@b/lib/utils';

import { utils } from '@iobroker/testing';
import { UserListWithChatID } from '@/types/app';
import type { Adapter } from '@b/types/types';

const { adapter, database } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('Utils', () => {
    const mockData: UserListWithChatID[] = [
        { name: 'Alice', chatID: '123', instance: 'telegram.0' },
        { name: 'Bob', chatID: '456', instance: 'telegram.0' },
        { name: 'Charlie', chatID: '789', instance: 'telegram.0' },
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
    afterEach(() => {
        adapter.resetMockHistory();
        database.clear();
    });
    it('should create a deep copy of an object', () => {
        const original = { a: 1, b: { c: 2 } };
        const copy = deepCopy(original, mockAdapter);

        expect(copy).to.deep.equal(original);
        expect(copy).to.not.equal(original); // Ensure it's not the same reference
    });

    it('should return undefined for undefined or null input', () => {
        expect(deepCopy(undefined, mockAdapter)).to.be.undefined;
        expect(deepCopy(null, mockAdapter)).to.be.undefined;
    });

    it('should handle arrays correctly', () => {
        const original = [1, 2, { a: 3 }];
        const copy = deepCopy(original, mockAdapter);

        expect(copy).to.deep.equal(original);
        expect(copy).to.not.equal(original); // Ensure it's not the same reference
    });

    it('should return undefined for circular references', () => {
        const circular: any = {};
        circular.self = circular;

        const copy = deepCopy(circular, mockAdapter);
        expect(copy).to.be.undefined; // JSON.stringify throws an error for circular references
    });
});

describe('checkDirectoryIsOk', () => {
    it('should return false and log an error if the directory is undefined', () => {
        const result = validateDirectory(mockAdapter, undefined as unknown as string);
        expect(result).to.be.false;
        expect(adapter.log.error.called).to.be.true;
        expect(adapter.log.error.firstCall.args[0]).to.equal(
            'No directory to save the picture. Please add a directory in the settings with full read and write permissions.',
        );
    });

    it('should return false and log an error if the directory is an empty string', () => {
        const result = validateDirectory(mockAdapter, '');
        expect(result).to.be.false;
    });

    it('should return true if the directory is valid', () => {
        const result = validateDirectory(mockAdapter, '/valid/directory');
        expect(result).to.be.true;
    });
});

describe('isTruthy', () => {
    it('should return true for truthy values', () => {
        expect(isTruthy(1)).to.be.true;
        expect(isTruthy('1')).to.be.true;
        expect(isTruthy(true)).to.be.true;
        expect(isTruthy('true')).to.be.true;
    });

    it('should return false for falsy values', () => {
        expect(isTruthy(0)).to.be.false;
        expect(isTruthy('0')).to.be.false;
        expect(isTruthy(false)).to.be.false;
        expect(isTruthy('false')).to.be.false;
        expect(isTruthy(undefined)).to.be.false;
        expect(isTruthy(null)).to.be.false;
    });
});

describe('isFalsy', () => {
    it('should return true for falsy values', () => {
        expect(isFalsy(0)).to.be.true;
        expect(isFalsy('0')).to.be.true;
        expect(isFalsy(false)).to.be.true;
        expect(isFalsy('false')).to.be.true;
        expect(isFalsy(undefined)).to.be.true;
        expect(isFalsy(null)).to.be.true;
    });

    it('should return false for truthy values', () => {
        expect(isFalsy(1)).to.be.false;
        expect(isFalsy('1')).to.be.false;
        expect(isFalsy(true)).to.be.false;
        expect(isFalsy('true')).to.be.false;
    });
});
