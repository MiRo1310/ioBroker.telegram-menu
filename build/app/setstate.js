"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSetState = exports.setstateIobroker = void 0;
const config_1 = require("../config/config");
const string_1 = require("../lib/string");
const utilities_1 = require("../lib/utilities");
const utils_1 = require("../lib/utils");
const logging_1 = require("../app/logging");
const dynamicValue_1 = require("../app/dynamicValue");
const setStateIdsToListenTo_1 = require("../app/setStateIdsToListenTo");
const exchangeValue_1 = require("../lib/exchangeValue");
const telegram_1 = require("../app/telegram");
const modifiedValue = (valueFromSubmenu, value) => {
    return value.includes(config_1.config.modifiedValue)
        ? value.replace(config_1.config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};
const isDynamicValueToSet = async (adapter, value) => {
    if (typeof value === 'string' && value.includes(config_1.config.dynamicValue.start)) {
        const { substring, substringExcludeSearch: id } = (0, string_1.decomposeText)(value, config_1.config.dynamicValue.start, config_1.config.dynamicValue.end);
        const newValue = await adapter.getForeignStateAsync(id);
        return value.replace(substring, String(newValue?.val));
    }
    return value;
};
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
        const valueToSet = (0, utils_1.isDefined)(value) && (0, string_1.isNonEmptyString)(value)
            ? await isDynamicValueToSet(adapter, value)
            : modifiedValue(String(valueFromSubmenu), value);
        await (0, exports.setstateIobroker)({ adapter, id, value: valueToSet, ack });
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error setValue', error, adapter);
    }
};
function useOtherId(returnText) {
    return returnText.includes("{'id':'");
}
const handleSetState = async (instance, part, userToSend, valueFromSubmenu, telegramParams) => {
    const adapter = telegramParams.adapter;
    try {
        if (!part.switch) {
            return;
        }
        for (const { returnText: text, id: switchId, parse_mode, confirm, ack, toggle, value } of part.switch) {
            let idToGetValueFrom = switchId;
            let returnText = text;
            const useOtherIdFlag = useOtherId(returnText);
            if (returnText.includes(config_1.config.setDynamicValue)) {
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
            if (!useOtherIdFlag) {
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
                const { substring } = (0, string_1.decomposeText)(returnText, '{"id":', '}');
                const { json, isValidJson } = (0, string_1.parseJSON)(substring);
                if (!isValidJson) {
                    return;
                }
                if (json.id) {
                    idToGetValueFrom = json.id;
                    returnText = returnText.replace(substring, json.text);
                }
                await (0, setStateIdsToListenTo_1.addSetStateIds)(adapter, {
                    id: json.id,
                    confirm: true,
                    returnText: json.text,
                    userToSend: userToSend,
                });
            }
            if (toggle) {
                const state = await adapter.getForeignStateAsync(switchId);
                const val = state ? !state.val : false;
                await (0, exports.setstateIobroker)({ adapter, id: switchId, value: val, ack });
                valueToTelegram = val;
            }
            else {
                await setValue(adapter, switchId, value, valueFromSubmenu, ack);
            }
            if (useOtherIdFlag) {
                const state = await adapter.getForeignStateAsync(idToGetValueFrom);
                valueToTelegram = state ? state.val : valueToTelegram;
            }
            if (confirm) {
                const { textToSend } = (0, exchangeValue_1.exchangeValue)(adapter, returnText, valueToTelegram);
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