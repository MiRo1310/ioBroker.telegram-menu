import { expect } from 'chai';
import { getChatID } from '../lib/utils';
import type { UserListWithChatId } from '../types/types';

describe('getChatID', () => {
    const mockData: UserListWithChatId[] = [
        { name: 'Alice', chatID: '123' },
        { name: 'Bob', chatID: '456' },
        { name: 'Charlie', chatID: '789' },
    ];

    it('sollte die richtige chatID zurückgeben, wenn der Benutzer existiert', () => {
        const result = getChatID(mockData, 'Alice');
        expect(result).to.equal('123');
    });

    it('sollte undefined zurückgeben, wenn der Benutzer nicht existiert', () => {
        const result = getChatID(mockData, 'David');
        expect(result).to.be.undefined;
    });

    it('sollte undefined zurückgeben, wenn die Liste leer ist', () => {
        const result = getChatID([], 'Alice');
        expect(result).to.be.undefined;
    });
});
