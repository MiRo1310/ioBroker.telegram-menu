import type { Adapter, Part, TelegramParams } from '@backend/types/types';
import { textModifier } from '@backend/lib/utilities';
import { sendToTelegram } from '@backend/app/telegram';
import { errorLogger } from '@backend/app/logging';

export async function sendNav(
    adapter: Adapter,
    instance: string,
    part: Part | undefined,
    userToSend: string,
    telegramParams: TelegramParams,
): Promise<void> {
    try {
        if (userToSend && part) {
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
