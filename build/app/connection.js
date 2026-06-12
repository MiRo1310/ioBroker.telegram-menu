"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areAllCheckTelegramInstancesActive = void 0;
const appContext_1 = require("../app/appContext");
const string_1 = require("../lib/string");
const areAllCheckTelegramInstancesActive = async (appContext) => {
    await appContext.adapter.setState('info.connection', false, true);
    for (const instance of appContext.telegramInstanceList) {
        if (!instance?.active || !instance?.name) {
            continue;
        }
        const id = appContext_1.AppContext.telegramInfoConnectionID(instance.name);
        const telegramInfoConnection = await appContext.adapter.getForeignStateAsync(id);
        appContext.adapter.log.debug(`Telegram Info Connection: ${(0, string_1.jsonString)(telegramInfoConnection)}`);
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
exports.areAllCheckTelegramInstancesActive = areAllCheckTelegramInstancesActive;
//# sourceMappingURL=connection.js.map