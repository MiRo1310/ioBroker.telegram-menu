import type { Part } from '@backend/types/types';
import { textModifier } from '@backend/lib/utilities';
import { sendToTelegram } from '@backend/app/telegram';
import type { AppContext } from '@backend/app/appContext';

export async function sendNav(
    appContext: AppContext,
    instance: string,
    part: Part | undefined,
    userToSend: string,
): Promise<void> {
    if (userToSend && part) {
        const { nav: keyboard, text, parse_mode } = part;
        const textToSend = await textModifier(appContext, text ?? '');

        await sendToTelegram({
            instance,
            userToSend,
            textToSend,
            keyboard,
            appContext,
            parse_mode,
        });
    }
}
