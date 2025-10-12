"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areAllCheckTelegramInstancesActive = void 0;
const configVariables_1 = require("../app/configVariables");
const string_1 = require("../lib/string");
const areAllCheckTelegramInstancesActive = async (params) => {
    const { adapter } = params;
    const { telegramInfoConnectionID } = configVariables_1.getIds;
    await adapter.setState('info.connection', false, true);
    for (const instance of params.telegramInstanceList) {
        if (!instance?.active || !instance?.name) {
            continue;
        }
        const id = telegramInfoConnectionID(instance.name);
        const telegramInfoConnection = await adapter.getForeignStateAsync(id);
        adapter.log.debug(`Telegram Info Connection: ${(0, string_1.jsonString)(telegramInfoConnection)}`);
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
exports.areAllCheckTelegramInstancesActive = areAllCheckTelegramInstancesActive;
//# sourceMappingURL=connection.js.map