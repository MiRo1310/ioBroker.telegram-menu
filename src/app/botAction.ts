import { _this } from '../main';
import { errorLogger } from './logging';
import type { UserListWithChatId } from '../types/types';

const deleteMessageByBot = (
    instance: string,
    user: string,
    userListWithChatID: UserListWithChatId[],
    messageId: number,
    chat_id: string | number,
): void => {
    try {
        if (chat_id) {
            _this.log.debug(`Delete Message for ${user} ${chat_id} , MessageId: ${messageId}`);
        }
        _this.sendTo(instance, {
            deleteMessage: {
                options: {
                    chat_id: chat_id,
                    message_id: messageId,
                },
            },
        });
    } catch (e: any) {
        errorLogger('Error deleteMessage:', e);
    }
};
export { deleteMessageByBot };
