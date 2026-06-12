"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageByBot = void 0;
const deleteMessageByBot = (adapter, instance, user, messageId, chat_id) => {
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
};
exports.deleteMessageByBot = deleteMessageByBot;
//# sourceMappingURL=botAction.js.map