import type { Adapter } from '@b/types/types';
import { errorLogger } from '@b/app/logging';

const deleteMessageByBot = (
    adapter: Adapter,
    instance: string,
    user: string,
    messageId: number,
    chat_id: string | number,
): void => {
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
    } catch (e: any) {
        errorLogger('Error deleteMessage:', e, adapter);
    }
};
export { deleteMessageByBot };
