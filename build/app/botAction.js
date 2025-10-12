"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageByBot = void 0;
const logging_1 = require("../app/logging");
const deleteMessageByBot = (adapter, instance, user, messageId, chat_id) => {
    try {
        if (chat_id) {
            adapter.log.debug(`Delete Message for ${user} ${chat_id} , MessageId: ${messageId}`);
        }
        adapter.sendTo(instance, {
            deleteMessage: {
                options: {
                    chat_id: chat_id,
                    message_id: messageId,
                },
            },
        });
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error deleteMessage:', e, adapter);
    }
};
exports.deleteMessageByBot = deleteMessageByBot;
//# sourceMappingURL=botAction.js.map