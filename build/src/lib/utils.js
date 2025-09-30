"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFalsy = exports.isTruthy = exports.validateDirectory = exports.deepCopy = exports.isDefined = exports.getChatID = void 0;
const logging_1 = require("../app/logging");
const getChatID = (userListWithChatID, user) => {
    for (const element of userListWithChatID) {
        if (element.name === user) {
            return element.chatID;
        }
    }
    return;
};
exports.getChatID = getChatID;
const isDefined = (value) => value !== undefined && value !== null;
exports.isDefined = isDefined;
const deepCopy = (obj, adapter) => {
    try {
        return !(0, exports.isDefined)(obj) ? undefined : JSON.parse(JSON.stringify(obj));
    }
    catch (err) {
        (0, logging_1.errorLogger)(`Error deepCopy: `, err, adapter);
    }
};
exports.deepCopy = deepCopy;
function validateDirectory(adapter, directory) {
    if (!(0, exports.isDefined)(directory) || directory === '') {
        adapter.log.error('No directory to save the picture. Please add a directory in the settings with full read and write permissions.');
        return false;
    }
    return true;
}
exports.validateDirectory = validateDirectory;
const isTruthy = (value) => (0, exports.isDefined)(value) && ['1', 1, true, 'true'].includes(value);
exports.isTruthy = isTruthy;
const isFalsy = (value) => ['0', 0, false, 'false', undefined, null].includes(value);
exports.isFalsy = isFalsy;
//# sourceMappingURL=utils.js.map