import { sendToTelegram } from './telegram';
import { textModifier } from '../lib/utilities';
import type { Adapter, Part, TelegramParams } from '../types/types';
import { errorLogger } from './logging';

export async function sendNav(
    adapter: Adapter,
    instance: string,
    part: Part,
    userToSend: string,
    telegramParams: TelegramParams,
): Promise<void> {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await textModifier(adapter, text ?? '');

            await sendToTelegram({
                instance,
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
