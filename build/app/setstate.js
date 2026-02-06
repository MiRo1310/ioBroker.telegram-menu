"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetState = exports.setstateIobroker = exports._getDynamicValueIfIsIn = void 0;
const config_1 = require("../config/config");
const string_1 = require("../lib/string");
const utilities_1 = require("../lib/utilities");
const utils_1 = require("../lib/utils");
const logging_1 = require("../app/logging");
const dynamicValue_1 = require("../app/dynamicValue");
const setStateIdsToListenTo_1 = require("../app/setStateIdsToListenTo");
const exchangeValue_1 = require("../lib/exchangeValue");
const telegram_1 = require("../app/telegram");
const appUtils_1 = require("../lib/appUtils");
const modifiedValue = (valueFromSubmenu, value) => {
    return value.includes(config_1.config.modifiedValue)
        ? value.replace(config_1.config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};
const _getDynamicValueIfIsIn = async (adapter, text) => {
    const startValue = '{id:';
    const endValue = '}';
    if (text.includes(startValue)) {
        const { substring, substringExcludeSearch: id } = (0, string_1.decomposeText)(text, startValue, endValue);
        const state = await adapter.getForeignStateAsync((0, string_1.removeQuotes)(id));
        if (!(0, utils_1.isDefined)(state?.val)) {
            adapter.log.warn(`State with id ${id} not found or has no value`);
            return text.replace(substring, '');
        }
        if (!text.includes('{math:')) {
            const res = (0, string_1.removeDuplicateSpaces)(text.replace(substring, ''));
            return (0, exchangeValue_1.exchangeValue)(adapter, res, String(state.val), true).textToSend;
        }
        const newValue = text.replace(substring, '');
        const { error, textToSend, calculated } = (0, appUtils_1.mathFunction)(newValue, String(state?.val), adapter);
        return error ? String(state?.val) : (0, exchangeValue_1.exchangeValue)(adapter, textToSend, String(calculated), true).textToSend;
    }
    return (0, string_1.removeDuplicateSpaces)(text);
};
exports._getDynamicValueIfIsIn = _getDynamicValueIfIsIn;
const setstateIobroker = async ({ id, value, ack, adapter, }) => {
    try {
        const val = await (0, utilities_1.transformValueToTypeOfId)(adapter, id, value);
        adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(val)}`);
        if ((0, utils_1.isDefined)(val)) {
            await adapter.setForeignStateAsync(id, val, ack);
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error Setstate', error, adapter);
    }
};
exports.setstateIobroker = setstateIobroker;
const setValue = async (adapter, id, value, valueFromSubmenu, ack) => {
    try {
        adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(value)}`);
        const valueToSet = (0, utils_1.isDefined)(value) && (0, string_1.isNonEmptyString)(value)
            ? await (0, exports._getDynamicValueIfIsIn)(adapter, value)
            : modifiedValue(String(valueFromSubmenu), value);
        adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(valueToSet)}`);
        await (0, exports.setstateIobroker)({ adapter, id, value: valueToSet, ack });
        return valueToSet;
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error setValue', error, adapter);
    }
};
const foreignIdStart = "{'foreignId':'";
function handleUpdateFromForeignId(returnText) {
    return returnText.includes(foreignIdStart);
}
const handleSetState = async (adapter, instance, part, userToSend, valueFromSubmenu, telegramParams) => {
    try {
        if (!part.switch) {
            return;
        }
        for (const { returnText: text, id: switchId, parse_mode, confirm, ack, toggle, value } of part.switch) {
            let idToGetValueFrom = switchId;
            let returnText = text;
            const useForeignId = handleUpdateFromForeignId(returnText);
            if (returnText.includes('{setDynamicValue')) {
                const { confirmText, id } = await (0, dynamicValue_1.setDynamicValue)(instance, returnText, ack, idToGetValueFrom, userToSend, telegramParams, parse_mode, confirm);
                if (confirm) {
                    await (0, setStateIdsToListenTo_1.addSetStateIds)(adapter, {
                        id: id ?? idToGetValueFrom,
                        confirm,
                        returnText: confirmText,
                        userToSend,
                    });
                }
                return;
            }
            let valueToTelegram = valueFromSubmenu ?? value;
            if (!useForeignId) {
                await (0, setStateIdsToListenTo_1.addSetStateIds)(adapter, {
                    id: idToGetValueFrom,
                    confirm,
                    returnText,
                    userToSend,
                    parse_mode,
                });
            }
            else {
                returnText = returnText.replace(/'/g, '"');
                const { substring } = (0, string_1.decomposeText)(returnText, foreignIdStart, '}');
                const { json, isValidJson } = (0, string_1.parseJSON)(substring);
                if (!isValidJson) {
                    return;
                }
                if (json.foreignId) {
                    idToGetValueFrom = json.foreignId;
                    returnText = returnText.replace(substring, json.text);
                }
                await (0, setStateIdsToListenTo_1.addSetStateIds)(adapter, {
                    id: json.foreignId,
                    confirm: true,
                    returnText: json.text,
                    userToSend: userToSend,
                });
            }
            if (toggle) {
                const state = await adapter.getForeignStateAsync(switchId);
                const newValue = state ? !state.val : false;
                await (0, exports.setstateIobroker)({ adapter, id: switchId, value: newValue, ack });
                valueToTelegram = newValue;
            }
            else {
                const modifiedValue = await setValue(adapter, switchId, value, valueFromSubmenu, ack);
                if ((0, utils_1.isDefined)(modifiedValue)) {
                    valueToTelegram = modifiedValue;
                }
            }
            if (useForeignId) {
                const state = await adapter.getForeignStateAsync(idToGetValueFrom);
                valueToTelegram = state ? state.val : valueToTelegram;
            }
            if (confirm) {
                let { textToSend } = (0, exchangeValue_1.exchangeValue)(adapter, returnText, valueToTelegram);
                let i = 0;
                while (textToSend.includes('{id:') && i < 20) {
                    textToSend = String(await (0, exports._getDynamicValueIfIsIn)(adapter, textToSend));
                    i++;
                }
                const telegramData = {
                    instance,
                    userToSend,
                    textToSend,
                    telegramParams,
                    parse_mode,
                };
                await (0, telegram_1.sendToTelegram)(telegramData);
                return telegramData;
            }
        }
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error Switch', error, adapter);
    }
};
exports.handleSetState = handleSetState;
//# sourceMappingURL=setstate.js.map