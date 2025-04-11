import { sendToTelegram } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import type { Part, UserListWithChatId } from '../types/types';
import { _this } from '../main';
import { errorLogger } from './logging';

async function sendNav(
    part: Part,
    userToSend: string,
    instanceTelegram: string,
    userListWithChatID: UserListWithChatId[],
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
): Promise<void> {
    try {
        if (userToSend) {
            _this.log.debug('Send Nav to Telegram');
            const nav = part.nav;
            const text = await checkStatusInfo(part.text as string);

            await sendToTelegram({
                user: userToSend,
                textToSend: text as string,
                keyboard: nav,
                instance: instanceTelegram,
                resize_keyboard: resize_keyboard,
                one_time_keyboard: one_time_keyboard,
                userListWithChatID: userListWithChatID,
                parse_mode: part.parse_mode || 'false',
            });
        }
    } catch (e: any) {
        errorLogger('Error sendNav:', e);
    }
}

export { sendNav };
