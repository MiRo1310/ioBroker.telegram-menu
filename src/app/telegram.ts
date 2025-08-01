import { errorLogger } from './logging';
import { returnTextModifier } from '../lib/utilities';
import { adapter } from '../main';
import type { Keyboard, Location, Telegram, TelegramParams } from '../types/types';
import { getChatID } from '../lib/utils';
import { cleanUpString, isEmptyString, jsonString } from '../lib/string';
import { getParseMode } from '../lib/appUtils';

function validateTextToSend(textToSend: string | undefined): boolean {
    if (!textToSend || isEmptyString(textToSend)) {
        adapter.log.error('There is a problem! Text to send is empty or undefined, please check your configuration.');
        return false;
    }
    if (textToSend.includes('change{')) {
        adapter.log.warn(
            "To use 'change{'. The status must have a param to be exchanged, like: {status:'ID':true}. If you use it in another way, and it doesn't work, please check your configuration. If nothing helps, please open an issue on GitHub.",
        );
    }
    return true;
}

async function sendToTelegram({
    userToSend,
    textToSend,
    keyboard,
    telegramParams,
    parse_mode,
}: Telegram): Promise<void> {
    try {
        const { resize_keyboard, one_time_keyboard, userListWithChatID, telegramInstance } = telegramParams;
        const chatId = getChatID(userListWithChatID, userToSend);
        if (!telegramInstance) {
            return;
        }
        adapter.log.debug(
            `Send to: { user: ${userToSend} , chatId :${chatId} , text: ${textToSend} , instance: ${telegramInstance} , userListWithChatID: ${jsonString(userListWithChatID)} , parseMode: ${parse_mode} }`,
        );
        validateTextToSend(textToSend);

        if (!keyboard) {
            adapter.sendTo(
                telegramInstance,
                'send',
                {
                    text: cleanUpString(textToSend),
                    chatId,
                    parse_mode: getParseMode(parse_mode),
                },
                res => telegramLogger(res),
            );
            return;
        }

        adapter.sendTo(
            telegramInstance,
            'send',
            {
                chatId,
                parse_mode: getParseMode(parse_mode),
                text: await returnTextModifier(cleanUpString(textToSend)),
                reply_markup: {
                    keyboard,
                    resize_keyboard,
                    one_time_keyboard,
                },
            },
            res => telegramLogger(res),
        );
    } catch (e) {
        errorLogger('Error sendToTelegram:', e, adapter);
    }
}

function sendToTelegramSubmenu(
    user: string,
    textToSend: string,
    keyboard: Keyboard,
    telegramParams: TelegramParams,
    parse_mode?: boolean,
): void {
    const { telegramInstance: instance, userListWithChatID } = telegramParams;
    if (!validateTextToSend(textToSend) || !instance) {
        return;
    }

    adapter.sendTo(
        instance,
        'send',
        {
            chatId: getChatID(userListWithChatID, user),
            parse_mode: getParseMode(parse_mode),
            text: cleanUpString(textToSend),
            reply_markup: keyboard,
        },
        (res: any) => telegramLogger(res),
    );
}

const sendLocationToTelegram = async (
    user: string,
    data: Location[],
    telegramParams: TelegramParams,
): Promise<void> => {
    const { userListWithChatID, telegramInstance: instance } = telegramParams;
    try {
        const chatId = getChatID(userListWithChatID, user);

        for (const { longitude: longitudeID, latitude: latitudeID } of data) {
            if (!(latitudeID || longitudeID)) {
                continue;
            }

            const latitude = await adapter.getForeignStateAsync(latitudeID);
            const longitude = await adapter.getForeignStateAsync(longitudeID);
            if (!latitude || !longitude) {
                continue;
            }
            if (!instance) {
                return;
            }
            adapter.sendTo(
                instance,
                {
                    chatId: chatId,
                    latitude: latitude.val,
                    longitude: longitude.val,
                    disable_notification: true,
                },
                (res: any) => telegramLogger(res),
            );
        }
    } catch (e: any) {
        errorLogger('Error send location to telegram:', e, adapter);
    }
};

function telegramLogger(res: any): void {
    adapter.log.debug(`Telegram response : "${jsonString(res)}"`);
}

export { sendToTelegram, sendToTelegramSubmenu, sendLocationToTelegram };
