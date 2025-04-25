import { sendToTelegram } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import type { Part, UserListWithChatId } from '../types/types';
import { adapter } from '../main';
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
            adapter.log.debug('Send Nav to Telegram');
            const nav = part.nav;
            const text = await checkStatusInfo(part.text as string);

            await sendToTelegram({
                userToSend,
                textToSend: text,
                keyboard: nav,
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                parse_mode: part.parse_mode,
            });
        }
    } catch (e: any) {
        errorLogger('Error sendNav:', e, adapter);
    }
}

export { sendNav };
