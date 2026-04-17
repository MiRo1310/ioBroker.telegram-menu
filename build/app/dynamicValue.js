"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicValue = void 0;
const string_1 = require("../lib/string");
const telegram_1 = require("../app/telegram");
class DynamicValueHandler {
    dynamicValueObj = {};
    getValue = (userToSend) => this.dynamicValueObj[userToSend] ?? null;
    removeUser = (userToSend) => {
        if (this.dynamicValueObj[userToSend]) {
            delete this.dynamicValueObj[userToSend];
            return true;
        }
        return false;
    };
    setValue = async (instance, returnText, ack, id, userToSend, telegramParams, parse_mode, confirm) => {
        const { substringExcludeSearch } = (0, string_1.decomposeText)(returnText, '{setDynamicValue:', '}');
        let array = substringExcludeSearch.split(':');
        array = this.isBraceDeleteEntry(array);
        const question = array[0];
        const confirmText = array[2];
        if (question) {
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: question,
                telegramParams,
                parse_mode,
            });
        }
        this.dynamicValueObj[userToSend] = {
            idToSet: id,
            ack,
            returnText: confirmText,
            userToSend,
            parse_mode,
            confirm,
            telegramParams,
            valueType: array[1],
            watchForId: array[3],
        };
        if (confirmText && confirmText != '') {
            return { confirmText, id: array[3] !== '' ? array[3] : undefined };
        }
        return { confirmText: '', id: undefined };
    };
    isBraceDeleteEntry(array) {
        return array[4] === '}' ? array.slice(0, 4) : array;
    }
}
exports.dynamicValue = new DynamicValueHandler();
//# sourceMappingURL=dynamicValue.js.map