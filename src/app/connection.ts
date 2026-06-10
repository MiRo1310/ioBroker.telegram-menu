import { AppContext } from '@backend/app/appContext';
import { jsonString } from '@backend/lib/string';

export const areAllCheckTelegramInstancesActive = async (appContext: AppContext): Promise<boolean | undefined> => {
    await appContext.adapter.setState('info.connection', false, true);
    for (const instance of appContext.telegramInstanceList) {
        if (!instance?.active || !instance?.name) {
            continue;
        }
        const id = AppContext.telegramInfoConnectionID(instance.name);
        const telegramInfoConnection = await appContext.adapter.getForeignStateAsync(id);
        appContext.adapter.log.debug(`Telegram Info Connection: ${jsonString(telegramInfoConnection)}`);

        if (!telegramInfoConnection) {
            appContext.adapter.log.error(`The State ${id} was not found!`);
            return false;
        }
        const value = telegramInfoConnection?.val;

        await appContext.adapter.setState('info.connection', telegramInfoConnection?.val ?? false, true);
        if (!value) {
            appContext.adapter.log.info('A Selected instance of telegram is not running. Please start!');
            return false;
        }
    }
    await appContext.adapter.setState('info.connection', true, true);
    return true;
};
