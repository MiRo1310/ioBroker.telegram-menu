import { error } from 'console';
import { debug } from './logging';
import { sendToTelegram } from './telegram';
import { checkStatusInfo } from './utilities';
import type { Part, UserListWithChatId } from './telegram-menu';

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
            debug([{ text: 'Send Nav to Telegram' }]);
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
        error([
            { text: 'Error sendNav:', val: e.message },
            { text: 'Stack:', val: e.stack },
        ]);
    }
}

export { sendNav };
