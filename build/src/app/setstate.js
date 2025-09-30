"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetState = exports.setstateIobroker = void 0;
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const dynamicValue_1 = require("./dynamicValue");
const main_1 = require("../main");
const logging_1 = require("./logging");
const string_1 = require("../lib/string");
const utils_1 = require("../lib/utils");
const config_1 = require("../config/config");
const setStateIdsToListenTo_1 = require("./setStateIdsToListenTo");
const exchangeValue_1 = require("../lib/exchangeValue");
const modifiedValue = (valueFromSubmenu, value) => {
    return value.includes(config_1.config.modifiedValue)
        ? value.replace(config_1.config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};
const isDynamicValueToSet = async (value) => {
    if (typeof value === 'string' && value.includes(config_1.config.dynamicValue.start)) {
        const { substring, substringExcludeSearch: id } = (0, string_1.decomposeText)(value, config_1.config.dynamicValue.start, config_1.config.dynamicValue.end);
        const newValue = await main_1.adapter.getForeignStateAsync(id);
        return value.replace(substring, String(newValue?.val));
    }
    return value;
};
const setstateIobroker = async ({ id, value, ack, }) => {
    try {
        const val = await (0, utilities_1.transformValueToTypeOfId)(id, value);
        main_1.adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(val)}`);
        if ((0, utils_1.isDefined)(val)) {
            await main_1.adapter.setForeignStateAsync(id, val, ack);
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error Setstate', error, main_1.adapter);
    }
};
exports.setstateIobroker = setstateIobroker;
const setValue = async (id, value, valueFromSubmenu, ack) => {
    try {
        const valueToSet = (0, utils_1.isDefined)(value) && (0, string_1.isNonEmptyString)(value)
            ? await isDynamicValueToSet(value)
            : modifiedValue(String(valueFromSubmenu), value);
        await (0, exports.setstateIobroker)({ id, value: valueToSet, ack });
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error setValue', error, main_1.adapter);
    }
};
const handleSetState = async (instance, part, userToSend, valueFromSubmenu, telegramParams) => {
    try {
        if (!part.switch) {
            return;
        }
        for (const { returnText: text, id: ID, parse_mode, confirm, ack, toggle, value } of part.switch) {
            let returnText = text;
            if (returnText.includes(config_1.config.setDynamicValue)) {
                const { confirmText, id } = await (0, dynamicValue_1.setDynamicValue)(instance, returnText, ack, ID, userToSend, telegramParams, parse_mode, confirm);
                if (confirm) {
                    await (0, setStateIdsToListenTo_1.addSetStateIds)({
                        id: id ?? ID,
                        confirm,
                        returnText: confirmText,
                        userToSend,
                    });
                }
                return;
            }
            if (!returnText.includes("{'id':'")) {
                await (0, setStateIdsToListenTo_1.addSetStateIds)({
                    id: ID,
                    confirm,
                    returnText,
                    userToSend,
                    parse_mode,
                });
            }
            else {
                returnText = returnText.replace(/'/g, '"');
                const { substring } = (0, string_1.decomposeText)(returnText, '{"id":', '}');
                const { json, isValidJson } = (0, string_1.parseJSON)(substring);
                if (!isValidJson) {
                    return;
                }
                if (json.id) {
                    const state = await main_1.adapter.getForeignStateAsync(json.id);
                    const val = state ? String(state?.val) : '';
                    returnText = returnText.replace(substring, `${json.text} ${val}`);
                }
                await (0, setStateIdsToListenTo_1.addSetStateIds)({
                    id: json.id,
                    confirm: true,
                    returnText: json.text,
                    userToSend: userToSend,
                });
            }
            let valueToTelegram = valueFromSubmenu ?? value;
            if (toggle) {
                const state = await main_1.adapter.getForeignStateAsync(ID);
                const val = state ? !state.val : false;
                await (0, exports.setstateIobroker)({ id: ID, value: val, ack });
                valueToTelegram = val;
            }
            else {
                await setValue(ID, value, valueFromSubmenu, ack);
            }
            const { textToSend } = (0, exchangeValue_1.exchangeValue)(main_1.adapter, returnText, valueToTelegram);
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend,
                telegramParams,
                parse_mode,
            });
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error Switch', error, main_1.adapter);
    }
};
exports.handleSetState = handleSetState;
//# sourceMappingURL=setstate.js.map