"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserFromDynamicValue = exports.getDynamicValue = exports.setDynamicValue = void 0;
const string_1 = require("../lib/string");
const telegram_1 = require("./telegram");
const setDynamicValueObj = {};
const setDynamicValue = async (returnText, ack, id, userToSend, telegramInstance, oneTimeKeyboard, resizeKeyboard, userListWithChatID, parseMode, confirm) => {
    const { substring } = (0, string_1.decomposeText)(returnText, '{setDynamicValue:', '}');
    let array = substring.split(':');
    array = isBraceDeleteEntry(array);
    const text = array[1];
    if (text) {
        await (0, telegram_1.sendToTelegram)({
            userToSend,
            textToSend: text,
            instanceTelegram: telegramInstance,
            resizeKeyboard,
            oneTimeKeyboard,
            userListWithChatID,
            parseMode,
        });
    }
    setDynamicValueObj[userToSend] = {
        id,
        ack,
        returnText: text,
        userToSend,
        parseMode,
        confirm,
        telegramInstance,
        oneTimeKeyboard,
        resizeKeyboard,
        userListWithChatID,
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
//# sourceMappingURL=dynamicValue.js.map