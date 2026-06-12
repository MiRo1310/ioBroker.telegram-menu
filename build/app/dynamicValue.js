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
    setValue = async (appContext, instance, returnText, ack, id, userToSend, parse_mode, confirm) => {
        const { substringExcludeSearch } = (0, string_1.decomposeText)(returnText, '{setDynamicValue:', '}');
        const [question, valueType, confirmText, watchForId] = substringExcludeSearch.split(':');
        if (question) {
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: question,
                appContext,
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
            appContext,
            valueType,
            watchForId,
        };
        if (confirmText && confirmText != '') {
            return { confirmText, id: watchForId !== '' ? watchForId : undefined };
        }
        return { confirmText: '', id: undefined };
    };
}
exports.dynamicValue = new DynamicValueHandler();
//# sourceMappingURL=dynamicValue.js.map