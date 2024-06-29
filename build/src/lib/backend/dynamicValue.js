"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserFromDynamicValue = exports.getDynamicValue = exports.setDynamicValue = void 0;
const utilities_1 = require("./utilities");
const telegram_1 = require("./telegram");
const setDynamicValueObj = {};
const setDynamicValue = (returnText, ack, id, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode, confirm) => {
    const { substring } = (0, utilities_1.decomposeText)(returnText, "{setDynamicValue:", "}");
    const array = substring.split(":");
    const text = array[1];
    if (text) {
        (0, telegram_1.sendToTelegram)(userToSend, text, undefined, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, parse_mode);
    }
    setDynamicValueObj[userToSend] = {
        id: id,
        ack: ack,
        returnText: text,
        userToSend: userToSend,
        parse_mode: parse_mode,
        confirm: confirm,
        telegramInstance: telegramInstance,
        one_time_keyboard: one_time_keyboard,
        resize_keyboard: resize_keyboard,
        userListWithChatID: userListWithChatID,
        valueType: array[2],
    };
    if (array[3] && array[3] != "") {
        return { confirmText: array[3], id: array[4] };
    }
    return { confirmText: "", id: undefined };
};
exports.setDynamicValue = setDynamicValue;
const getDynamicValue = (userToSend) => {
    if (setDynamicValueObj[userToSend]) {
        return setDynamicValueObj[userToSend];
    }
    return null;
};
exports.getDynamicValue = getDynamicValue;
const removeUserFromDynamicValue = (userToSend) => {
    if (setDynamicValueObj[userToSend]) {
        delete setDynamicValueObj[userToSend];
        return true;
    }
    return false;
};
exports.removeUserFromDynamicValue = removeUserFromDynamicValue;
//# sourceMappingURL=dynamicValue.js.map