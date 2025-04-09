import TelegramMenu from '../main';
import { debug, errorLogger } from './logging';
import type { UserListWithChatId } from '../types/types';

const deleteMessageByBot = (
    instance: string,
    user: string,
    userListWithChatID: UserListWithChatId[],
    messageId: number,
    chat_id: string | number,
): void => {
    const _this = TelegramMenu.getInstance();
    try {
        if (chat_id) {
            debug([{ text: 'Delete Message for', val: `${user} ${chat_id} , MessageId: ${messageId}` }]);
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
