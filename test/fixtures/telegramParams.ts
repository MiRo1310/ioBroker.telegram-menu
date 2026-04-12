import type { Adapter, TelegramParams } from '@backend/types/types';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

export const telegramParams: TelegramParams = {
    adapter: mockAdapter,
    telegramInstanceList: [{ name: 'telegram.0', active: true }],
    one_time_keyboard: true,
    resize_keyboard: true,
    userListWithChatID: [{ name: 'Michael', chatID: '999', instance: 'telegram.0' }],
};
