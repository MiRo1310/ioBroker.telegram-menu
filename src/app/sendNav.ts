import { sendToTelegram } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import type { Part, TelegramParams, UserListWithChatId } from '../types/types';
import { adapter } from '../main';
import { errorLogger } from './logging';

export async function sendNav(
    part: Part,
    userToSend: string,
    userListWithChatID: UserListWithChatId[],
    telegramParams: TelegramParams,
): Promise<void> {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await checkStatusInfo(text ?? '');

            await sendToTelegram({
                userToSend,
                textToSend,
                keyboard,
                telegramParams,
                userListWithChatID,
                parse_mode,
            });
        }
    } catch (e: any) {
        errorLogger('Error sendNav:', e, adapter);
    }
}
