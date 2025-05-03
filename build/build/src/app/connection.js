"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsTelegramActive = void 0;
const main_1 = require("../main");
const string_1 = require("../lib/string");
const checkIsTelegramActive = async (dataPoint) => {
    await main_1._this.setState('info.connection', false, true);
    const telegramInfoConnection = await main_1._this.getForeignStateAsync(dataPoint);
    main_1._this.log.debug(`Telegram Info Connection: ${(0, string_1.jsonString)(telegramInfoConnection)}`);
    if (telegramInfoConnection?.val) {
        await main_1._this.setState('info.connection', telegramInfoConnection?.val, true);
    }
    if (!telegramInfoConnection?.val) {
        main_1._this.log.info('Telegram was found, but is not running. Please start!');
    }
    return !!telegramInfoConnection?.val;
};
exports.checkIsTelegramActive = checkIsTelegramActive;
