"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = void 0;
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const dynamicValue_1 = require("./dynamicValue");
const main_1 = require("../main");
const logging_1 = require("./logging");
const string_1 = require("../lib/string");
const utils_1 = require("../lib/utils");
const config_1 = require("../config/config");
const modifiedValue = (valueFromSubmenu, value) => {
    return value.includes(config_1.config.modifiedValue)
        ? value.replace(config_1.config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};
const isDynamicValueToSet = async (value) => {
    if (typeof value === 'string' && value.includes(config_1.config.dynamicValue.start)) {
        const { substring, substringExcludeSearch: id } = (0, string_1.decomposeText)(value, config_1.config.dynamicValue.start, config_1.config.dynamicValue.end);
        const newValue = await main_1.adapter.getForeignStateAsync(id);
        if (typeof newValue?.val === 'string') {
            return value.replace(substring, newValue.val);
        }
    }
    return value;
};
const setValue = async (id, value, SubmenuValuePriority, valueFromSubmenu, ack) => {
    try {
        let valueToSet;
        SubmenuValuePriority
            ? (valueToSet = modifiedValue(valueFromSubmenu, value))
            : (valueToSet = await isDynamicValueToSet(value));
        await (0, utilities_1.checkTypeOfId)(id, valueToSet).then((val) => {
            valueToSet = val;
            main_1.adapter.log.debug(`Value to Set: ${(0, string_1.jsonString)(valueToSet)}`);
            if (valueToSet !== undefined && valueToSet !== null) {
                main_1.adapter.setForeignState(id, valueToSet, ack);
            }
        });
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error setValue', error, main_1.adapter);
    }
};
const setState = async (part, userToSend, valueFromSubmenu, SubmenuValuePriority, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID) => {
    try {
        const setStateIds = [];
        if (!part.switch) {
            return;
        }
        for (const { returnText: text, id: ID, parse_mode, confirm, ack, toggle, value } of part.switch) {
            let returnText = text;
            if (returnText.includes(config_1.config.setDynamicValue)) {
                const { confirmText, id } = await (0, dynamicValue_1.setDynamicValue)(returnText, (0, utils_1.isTruthy)(ack), ID, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode, confirm);
                if (confirm) {
                    setStateIds.push({
                        id: id ?? ID,
                        confirm,
                        returnText: confirmText,
                        userToSend: userToSend,
                    });
                    return setStateIds;
                }
            }
            if (!returnText.includes("{'id':'")) {
                setStateIds.push({
                    id: ID,
                    confirm,
                    returnText,
                    userToSend,
                    parse_mode,
                });
            }
            else {
                returnText = returnText.replace(/'/g, '"');
                const textToSend = returnText.slice(0, returnText.indexOf('{')).trim();
                const { json, isValidJson } = (0, string_1.parseJSON)(returnText.slice(returnText.indexOf('{'), returnText.indexOf('}') + 1));
                if (!isValidJson) {
                    return;
                }
                json.text = json.text + returnText.slice(returnText.indexOf('}') + 1);
                if (textToSend && textToSend !== '') {
                    await (0, telegram_1.sendToTelegram)({
                        userToSend,
                        textToSend,
                        telegramInstance,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                        parse_mode,
                    });
                }
                setStateIds.push({
                    id: json.id,
                    confirm: true,
                    returnText: json.text,
                    userToSend: userToSend,
                });
            }
            if (toggle) {
                main_1.adapter
                    .getForeignStateAsync(ID)
                    .then(val => {
                    if (val) {
                        main_1.adapter.setForeignStateAsync(ID, !val.val, ack).catch((e) => {
                            (0, logging_1.errorLogger)('Error setForeignStateAsync:', e, main_1.adapter);
                        });
                    }
                })
                    .catch((e) => {
                    (0, logging_1.errorLogger)('Error getForeignStateAsync:', e, main_1.adapter);
                });
            }
            else {
                await setValue(ID, value, SubmenuValuePriority, valueFromSubmenu, (0, utils_1.isTruthy)(ack));
            }
        }
        return setStateIds;
    }
    catch (error) {
        (0, logging_1.errorLogger)('Error Switch', error, main_1.adapter);
    }
};
exports.setState = setState;
//# sourceMappingURL=setstate.js.map