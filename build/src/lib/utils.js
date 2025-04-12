"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = exports.isDefined = exports.getChatID = void 0;
exports.validateDirectory = validateDirectory;
const logging_1 = require("../app/logging");
const adapterManager_1 = require("../app/adapterManager");
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
const deepCopy = (obj) => {
    try {
        return !(0, exports.isDefined)(obj) ? undefined : JSON.parse(JSON.stringify(obj));
    }
    catch (err) {
        (0, logging_1.errorLogger)(`Error deepCopy: `, err);
    }
};
exports.deepCopy = deepCopy;
function validateDirectory(directory) {
    if (!(0, exports.isDefined)(directory) || directory === '') {
        adapterManager_1.adapter.log.error('No directory to save the picture. Please add a directory in the settings with full read and write permissions.');
        return false;
    }
    return true;
}
//# sourceMappingURL=utils.js.map