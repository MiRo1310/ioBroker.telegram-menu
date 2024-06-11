"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = void 0;
const telegram_1 = require("./telegram");
const utilities_1 = require("./utilities");
const dynamicValue_1 = require("./dynamicValue");
const global_1 = require("./global");
const main_1 = __importDefault(require("../../main"));
const logging_1 = require("./logging");
const modifiedValue = (valueFromSubmenu, value) => {
    if (value && typeof value === "string" && value.includes("{value}")) {
        return value.replace("{value}", valueFromSubmenu);
    }
    return valueFromSubmenu;
};
const isDynamicValueToSet = async (value) => {
    const _this = main_1.default.getInstance();
    if (typeof value === "string" && value.includes("{id:")) {
        const result = (0, global_1.decomposeText)(value, "{id:", "}");
        const id = result.substring.replace("{id:", "").replace("}", "");
        const newValue = await _this.getForeignStateAsync(id);
        if (newValue && newValue.val && typeof newValue.val === "string") {
            return value.replace(result.substring, newValue.val);
        }
    }
    return value;
};
const setValue = async (id, value, SubmenuValuePriority, valueFromSubmenu, ack) => {
    try {
        const _this = main_1.default.getInstance();
        let valueToSet;
        SubmenuValuePriority ? (valueToSet = modifiedValue(valueFromSubmenu, value)) : (valueToSet = await isDynamicValueToSet(value));
        (0, utilities_1.checkTypeOfId)(id, valueToSet).then((val) => {
            valueToSet = val;
            (0, logging_1.debug)([{ text: "Value to Set:", val: valueToSet }]);
            if (valueToSet) {
                _this.setForeignState(id, valueToSet, ack);
            }
        });
    }
    catch (error) {
        error([
            { text: "Error setValue", val: error.message },
            { text: "Stack", val: error.stack },
        ]);
    }
};
const setState = async (part, userToSend, valueFromSubmenu, SubmenuValuePriority, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID) => {
    const _this = main_1.default.getInstance();
    try {
        const setStateIds = [];
        part.switch?.forEach((element) => {
            (0, logging_1.debug)([{ text: "Element to set:", val: element }]);
            let ack = false;
            let returnText = element.returnText;
            (0, logging_1.debug)([{ text: "Set ack:", val: element["ack"] }]);
            ack = element?.ack ? element.ack === "true" : false;
            if (returnText.includes("{setDynamicValue")) {
                const confirmText = (0, dynamicValue_1.setDynamicValue)(returnText, ack, element.id, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, element.parse_mode, element.confirm);
                if (element.confirm) {
                    return setStateIds.push({
                        id: element.id,
                        confirm: element.confirm,
                        returnText: confirmText,
                        userToSend: userToSend,
                    });
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
                (0, logging_1.debug)([{ text: "SetStateIds:", val: setStateIds }]);
            }
            else {
                try {
                    (0, logging_1.debug)([{ text: "ReturnText:", val: returnText }]);
                    returnText = returnText.replaceAll("'", '"');
                    const textToSend = returnText.slice(0, returnText.indexOf("{")).trim();
                    const returnObj = JSON.parse(returnText.slice(returnText.indexOf("{"), returnText.indexOf("}") + 1));
                    returnObj.text = returnObj.text + returnText.slice(returnText.indexOf("}") + 1);
                    if (textToSend && textToSend !== "") {
                        (0, telegram_1.sendToTelegram)(userToSend, textToSend, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, element.parse_mode);
                    }
                    (0, logging_1.debug)([{ text: "JSON parse:", val: returnObj }]);
                    setStateIds.push({
                        id: returnObj.id,
                        confirm: true,
                        returnText: returnObj.text,
                        userToSend: userToSend,
                    });
                    (0, logging_1.debug)([{ text: "SetStateIds", val: setStateIds }]);
                }
                catch (e) {
                    (0, logging_1.error)([
                        { text: "Error parsing returnObj:", val: e.message },
                        { text: "Stack:", val: e.stack },
                    ]);
                }
            }
            if (element.toggle) {
                (0, logging_1.debug)([{ text: "Toggle" }]);
                _this
                    .getForeignStateAsync(element.id)
                    .then((val) => {
                    if (val) {
                        _this.setForeignStateAsync(element.id, !val.val, ack);
                    }
                })
                    .catch((e) => {
                    (0, logging_1.error)([
                        { text: "Error", val: e.message },
                        { text: "Stack", val: e.stack },
                    ]);
                });
            }
            else {
                setValue(element.id, element.value, SubmenuValuePriority, valueFromSubmenu, ack);
            }
        });
        return setStateIds;
    }
    catch (error) {
        error([
            { text: "Error Switch", val: error.message },
            { text: "Stack", val: error.stack },
        ]);
    }
};
exports.setState = setState;
//# sourceMappingURL=setstate.js.map