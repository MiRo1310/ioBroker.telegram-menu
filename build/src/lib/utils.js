"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefined = exports.getChatID = void 0;
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
//# sourceMappingURL=utils.js.map