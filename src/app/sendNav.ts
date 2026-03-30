import type { Adapter, Part, TelegramParams } from '@b/types/types';
import { textModifier } from '@b/lib/utilities';
import { sendToTelegram } from '@b/app/telegram';
import { errorLogger } from '@b/app/logging';

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
