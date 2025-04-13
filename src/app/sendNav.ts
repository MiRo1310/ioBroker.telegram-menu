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
    resizeKeyboard: boolean,
    oneTimeKeyboard: boolean,
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
                instanceTelegram,
                resizeKeyboard,
                oneTimeKeyboard,
                userListWithChatID,
                parseMode: part.parseMode,
            });
        }
    } catch (e: any) {
        errorLogger('Error sendNav:', e, adapter);
    }
}

export { sendNav };
