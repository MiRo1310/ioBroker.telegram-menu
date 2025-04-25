"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = void 0;
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const dynamicValue_1 = require("./dynamicValue");
const main_1 = require("../main");
const logging_1 = require("./logging");
const string_1 = require("../lib/string");
const modifiedValue = (valueFromSubmenu, value) => {
    if (value && value.includes('{value}')) {
        return value.replace('{value}', valueFromSubmenu);
    }
    return valueFromSubmenu;
};
const isDynamicValueToSet = async (value) => {
    if (typeof value === 'string' && value.includes('{id:')) {
        const result = (0, string_1.decomposeText)(value, '{id:', '}');
        const id = result.substring.replace('{id:', '').replace('}', '');
        const newValue = await main_1.adapter.getForeignStateAsync(id);
        if (newValue && newValue.val && typeof newValue.val === 'string') {
            return value.replace(result.substring, newValue.val);
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
        for (const element of part.switch) {
            let ack = false;
            let returnText = element.returnText;
            ack = element?.ack ? element.ack === 'true' : false;
            if (returnText.includes('{setDynamicValue')) {
                const { confirmText, id } = await (0, dynamicValue_1.setDynamicValue)(returnText, ack, element.id, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, element.parse_mode, element.confirm);
                if (element.confirm) {
                    setStateIds.push({
                        id: id || element.id,
                        confirm: element.confirm,
                        returnText: confirmText,
                        userToSend: userToSend,
                    });
                    return setStateIds;
                }
            }
            if (!returnText.includes("{'id':'")) {
                setStateIds.push({
                    id: element.id,
                    confirm: element.confirm,
                    returnText: returnText,
                    userToSend: userToSend,
                    parse_mode: element.parse_mode,
                });
            }
            else {
                returnText = returnText.replace(/'/g, '"');
                const textToSend = returnText.slice(0, returnText.indexOf('{')).trim();
                const returnObj = JSON.parse(returnText.slice(returnText.indexOf('{'), returnText.indexOf('}') + 1));
                returnObj.text = returnObj.text + returnText.slice(returnText.indexOf('}') + 1);
                if (textToSend && textToSend !== '') {
                    await (0, telegram_1.sendToTelegram)({
                        userToSend,
                        textToSend,
                        telegramInstance: telegramInstance,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                        parse_mode: element.parse_mode,
                    });
                }
                setStateIds.push({
                    id: returnObj.id,
                    confirm: true,
                    returnText: returnObj.text,
                    userToSend: userToSend,
                });
            }
            if (element.toggle) {
                main_1.adapter
                    .getForeignStateAsync(element.id)
                    .then(val => {
                    if (val) {
                        main_1.adapter.setForeignStateAsync(element.id, !val.val, ack).catch((e) => {
                            (0, logging_1.errorLogger)('Error setForeignStateAsync:', e, main_1.adapter);
                        });
                    }
                })
                    .catch((e) => {
                    (0, logging_1.errorLogger)('Error getForeignStateAsync:', e, main_1.adapter);
                });
            }
            else {
                await setValue(element.id, element.value, SubmenuValuePriority, valueFromSubmenu, ack);
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