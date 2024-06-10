"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageByBot = void 0;
const main_1 = __importDefault(require("../../main"));
const logging_1 = require("./logging");
const deleteMessageByBot = async (instance, user, userListWithChatID, messageId, chat_id) => {
    const _this = main_1.default.getInstance();
    try {
        if (chat_id) {
            (0, logging_1.debug)([{ text: "Delete Message for", val: user + " " + chat_id + " , MessageId: " + messageId }]);
        }
        _this.sendTo(instance, {
            deleteMessage: {
                options: {
                    chat_id: chat_id,
                    message_id: messageId,
                },
            },
        });
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error deleteMessage:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
};
exports.deleteMessageByBot = deleteMessageByBot;
//# sourceMappingURL=botAction.js.map