"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserFromDynamicValue = exports.getDynamicValue = exports.setDynamicValue = void 0;
const utilities_1 = require("../lib/utilities");
const telegram_1 = require("./telegram");
const setDynamicValueObj = {};
const setDynamicValue = async (returnText, ack, id, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode, confirm) => {
    const { substring } = (0, utilities_1.decomposeText)(returnText, '{setDynamicValue:', '}');
    let array = substring.split(':');
    array = isBraceDeleteEntry(array);
    const text = array[1];
    if (text) {
        await (0, telegram_1.sendToTelegram)({
            user: userToSend,
            textToSend: text,
            keyboard: undefined,
            instance: telegramInstance,
            resize_keyboard: resize_keyboard,
            one_time_keyboard: one_time_keyboard,
            userListWithChatID: userListWithChatID,
            parse_mode: parse_mode,
        });
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
    if (array[3] && array[3] != '') {
        return { confirmText: array[3], id: array[4] };
    }
    return { confirmText: '', id: undefined };
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
function isBraceDeleteEntry(array) {
    if (array[4] === '}') {
        return array.slice(0, 4);
    }
    return array;
}
