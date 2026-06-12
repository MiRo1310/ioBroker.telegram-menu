import type { Adapter } from '@backend/types/types';
import { utils } from '@iobroker/testing';
import { createAppContextMock } from './appContextMock';
import type { AppContext } from '@backend/app/appContext';

const { adapter } = utils.unit.createMocks({});
export const mockAdapter = adapter as unknown as Adapter;

export const store: AppContext = createAppContextMock(mockAdapter, {
    userListWithChatID: [{ name: 'Michael', chatID: '999', instance: 'telegram.0' }],
});
