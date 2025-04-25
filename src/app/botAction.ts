import { adapter } from '../main';
import { errorLogger } from './logging';

const deleteMessageByBot = (instance: string, user: string, messageId: number, chat_id: string | number): void => {
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
