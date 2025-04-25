import { sendToTelegram } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import type { Part, UserListWithChatId } from '../types/types';
import { adapter } from '../main';
import { errorLogger } from './logging';

export async function sendNav(
    part: Part,
    userToSend: string,
    telegramInstance: string,
    userListWithChatID: UserListWithChatId[],
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
): Promise<void> {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await checkStatusInfo(text ?? '');

            await sendToTelegram({
                userToSend,
                textToSend,
                keyboard,
                telegramInstance,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                parse_mode,
            });
        }
    } catch (e: any) {
        errorLogger('Error sendNav:', e, adapter);
    }
}
