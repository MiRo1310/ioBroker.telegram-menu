"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserFromDynamicValue = exports.getDynamicValue = exports.setDynamicValue = void 0;
const string_1 = require("../lib/string");
const telegram_1 = require("./telegram");
const dynamicValueObj = {};
const setDynamicValue = async (instance, returnText, ack, id, userToSend, telegramParams, parse_mode, confirm) => {
    const { substringExcludeSearch } = (0, string_1.decomposeText)(returnText, '{setDynamicValue:', '}');
    let array = substringExcludeSearch.split(':');
    array = isBraceDeleteEntry(array);
    const text = array[0];
    if (text) {
        await (0, telegram_1.sendToTelegram)({
            instance,
            userToSend,
            textToSend: text,
            telegramParams,
            parse_mode,
        });
    }
    dynamicValueObj[userToSend] = {
        id,
        ack,
        returnText: text,
        userToSend,
        parse_mode,
        confirm,
        telegramParams,
        valueType: array[1],
        navToGoTo: array[3],
    };
    if (array[2] && array[2] != '') {
        return { confirmText: array[2], id: array[3] !== '' ? array[3] : undefined };
    }
    return { confirmText: '', id: undefined };
};
exports.setDynamicValue = setDynamicValue;
const getDynamicValue = (userToSend) => dynamicValueObj[userToSend] ?? null;
exports.getDynamicValue = getDynamicValue;
const removeUserFromDynamicValue = (userToSend) => {
    if (dynamicValueObj[userToSend]) {
        delete dynamicValueObj[userToSend];
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