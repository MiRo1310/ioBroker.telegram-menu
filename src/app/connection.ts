import { _this } from '../main';
import { jsonString } from '../lib/string';

export const checkIsTelegramActive = async (dataPoint: string): Promise<boolean | undefined> => {
    await _this.setState('info.connection', false, true);
    const telegramInfoConnection = await _this.getForeignStateAsync(dataPoint);

    _this.log.debug(`Telegram Info Connection: ${jsonString(telegramInfoConnection)}`);
    if (telegramInfoConnection?.val) {
        await _this.setState('info.connection', telegramInfoConnection?.val, true);
    }
    if (!telegramInfoConnection?.val) {
        _this.log.info('Telegram was found, but is not running. Please start!');
    }
    return !!telegramInfoConnection?.val;
};
