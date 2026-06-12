import type { Adapter } from '@backend/types/types';

const deleteMessageByBot = (
    adapter: Adapter,
    instance: string,
    user: string,
    messageId: number,
    chat_id: string | number,
): void => {
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
export { deleteMessageByBot };
