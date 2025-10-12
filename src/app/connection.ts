import { jsonString } from '../lib/string';
import type { TelegramParams } from '../types/types';
import { getIds } from './configVariables';

export const areAllCheckTelegramInstancesActive = async (params: TelegramParams): Promise<boolean | undefined> => {
    const { adapter } = params;
    const { telegramInfoConnectionID } = getIds;
    await adapter.setState('info.connection', false, true);
    for (const instance of params.telegramInstanceList) {
        if (!instance?.active || !instance?.name) {
            continue;
        }
        const id = telegramInfoConnectionID(instance.name);
        const telegramInfoConnection = await adapter.getForeignStateAsync(id);
        adapter.log.debug(`Telegram Info Connection: ${jsonString(telegramInfoConnection)}`);

        if (!telegramInfoConnection) {
            adapter.log.error(`The State ${id} was not found!`);
            return false;
        }
        const value = telegramInfoConnection?.val;

        await adapter.setState('info.connection', telegramInfoConnection?.val ?? false, true);
        if (!value) {
            adapter.log.info('A Selected instance of telegram is not running. Please start!');
            return false;
        }
    }
    await adapter.setState('info.connection', true, true);
    return true;
};
