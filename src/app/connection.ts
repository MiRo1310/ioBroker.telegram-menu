import { adapter } from '../main';
import { jsonString } from '../lib/string';

export const checkIsTelegramActive = async (dataPoint: string): Promise<boolean | undefined> => {
    await adapter.setState('info.connection', false, true);
    const telegramInfoConnection = await adapter.getForeignStateAsync(dataPoint);

    adapter.log.debug(`Telegram Info Connection: ${jsonString(telegramInfoConnection)}`);
    const value = telegramInfoConnection?.val;
    if (value) {
        await adapter.setState('info.connection', telegramInfoConnection?.val, true);
    } else {
        adapter.log.info('Telegram was found, but is not running. Please start!');
    }

    return !!value;
};
