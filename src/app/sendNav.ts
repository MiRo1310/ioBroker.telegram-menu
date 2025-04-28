import { sendToTelegram } from './telegram';
import { checkStatusInfo } from '../lib/utilities';
import type { Part, TelegramParams } from '../types/types';
import { adapter } from '../main';
import { errorLogger } from './logging';

export async function sendNav(part: Part, userToSend: string, telegramParams: TelegramParams): Promise<void> {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await checkStatusInfo(text ?? '');

            await sendToTelegram({
                userToSend,
                textToSend,
                keyboard,
                telegramParams,
                parse_mode,
            });
        }
    } catch (e: any) {
        errorLogger('Error sendNav:', e, adapter);
    }
}
