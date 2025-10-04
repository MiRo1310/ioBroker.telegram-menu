"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageByBot = void 0;
const main_1 = require("../main");
const logging_1 = require("./logging");
const deleteMessageByBot = (instance, user, messageId, chat_id) => {
    try {
        if (chat_id) {
            main_1.adapter.log.debug(`Delete Message for ${user} ${chat_id} , MessageId: ${messageId}`);
        }
        main_1.adapter.sendTo(instance, {
            deleteMessage: {
                options: {
                    chat_id: chat_id,
                    message_id: messageId,
                },
            },
        });
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error deleteMessage:', e, main_1.adapter);
    }
};
exports.deleteMessageByBot = deleteMessageByBot;
//# sourceMappingURL=botAction.js.map