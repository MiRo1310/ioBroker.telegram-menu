import { errorLogger } from './logging';
import { textModifier } from '../lib/utilities';
import type { Adapter, Keyboard, Location, Telegram, TelegramParams } from '../types/types';
import { getChatID } from '../lib/utils';
import { cleanUpString, isEmptyString, jsonString } from '../lib/string';
import { getParseMode } from '../lib/appUtils';
import { isInstanceActive } from './instance';

function validateTextToSend(adapter: Adapter, textToSend: string | undefined): boolean {
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
    instance,
    userToSend,
    textToSend,
    keyboard,
    telegramParams,
    parse_mode,
}: Telegram): Promise<void> {
    const { resize_keyboard, one_time_keyboard, userListWithChatID, adapter } = telegramParams;
    try {
        const chatId = getChatID(userListWithChatID, userToSend);

        if (!instance || !isInstanceActive(telegramParams.telegramInstanceList, instance)) {
            return;
        }
        adapter.log.debug(
            `Send to: { user: ${userToSend} , chatId :${chatId} , text: ${textToSend} , instance: ${instance} , userListWithChatID: ${jsonString(userListWithChatID)} , parseMode: ${parse_mode} }`,
        );
        validateTextToSend(adapter, textToSend);

        if (!keyboard) {
            adapter.sendTo(
                instance,
                'send',
                {
                    text: cleanUpString(textToSend),
                    chatId,
                    parse_mode: getParseMode(parse_mode),
                },
                res => telegramLogger(adapter, res),
            );
            return;
        }

        adapter.sendTo(
            instance,
            'send',
            {
                chatId,
                parse_mode: getParseMode(parse_mode),
                text: await textModifier(adapter, cleanUpString(textToSend)),
                reply_markup: {
                    keyboard,
                    resize_keyboard,
                    one_time_keyboard,
                },
            },
            res => telegramLogger(adapter, res),
        );
    } catch (e) {
        errorLogger('Error sendToTelegram:', e, adapter);
    }
}

function sendToTelegramSubmenu(
    telegramInstance: string,
    user: string,
    textToSend: string,
    keyboard: Keyboard,
    telegramParams: TelegramParams,
    parse_mode?: boolean,
): void {
    const { userListWithChatID, adapter } = telegramParams;
    if (!validateTextToSend(adapter, textToSend)) {
        return;
    }

    adapter.sendTo(
        telegramInstance,
        'send',
        {
            chatId: getChatID(userListWithChatID, user),
            parse_mode: getParseMode(parse_mode),
            text: cleanUpString(textToSend),
            reply_markup: keyboard,
        },
        (res: any) => telegramLogger(adapter, res),
    );
}

const sendLocationToTelegram = async (
    telegramInstance: string,
    user: string,
    data: Location[],
    telegramParams: TelegramParams,
): Promise<void> => {
    const { userListWithChatID, adapter } = telegramParams;
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
            adapter.sendTo(
                telegramInstance,
                {
                    chatId: chatId,
                    latitude: latitude.val,
                    longitude: longitude.val,
                    disable_notification: true,
                },
                (res: any) => telegramLogger(adapter, res),
            );
        }
    } catch (e: any) {
        errorLogger('Error send location to telegram:', e, adapter);
    }
};

function telegramLogger(adapter: Adapter, res: any): void {
    adapter.log.debug(`Telegram response : "${jsonString(res)}"`);
}

export { sendToTelegram, sendToTelegramSubmenu, sendLocationToTelegram };
