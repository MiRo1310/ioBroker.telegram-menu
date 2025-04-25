import { errorLogger } from './logging';
import { checkStatusInfo } from '../lib/utilities';
import { adapter } from '../main';
import type { Keyboard, Location, Telegram, UserListWithChatId } from '../types/types';
import { getChatID } from '../lib/utils';
import { jsonString, cleanUpString } from '../lib/string';
import { getParseMode } from '../lib/appUtils';
import { defaultTelegramInstance } from '../config/config';

async function sendToTelegram({
    userToSend = '',
    textToSend,
    keyboard,
    telegramInstance = defaultTelegramInstance,
    resize_keyboard = true,
    one_time_keyboard = true,
    userListWithChatID,
    parse_mode = false,
}: Telegram): Promise<void> {
    try {
        const chatId = getChatID(userListWithChatID, userToSend);
        const parse_modeType = getParseMode(parse_mode);

        adapter.log.debug(`Send to: ${userToSend} => ${textToSend}`);
        adapter.log.debug(`Instance: ${telegramInstance}`);
        adapter.log.debug(`UserListWithChatID	: ${jsonString(userListWithChatID)}`);
        adapter.log.debug(`Parse_mode	: ${parse_mode}`);
        adapter.log.debug(`ChatId	: ${chatId}`);
        adapter.log.debug(`ParseModeType: ${parse_modeType}`);

        const validatedTextToSend = cleanUpString(textToSend ?? '');
        if (!keyboard) {
            adapter.sendTo(
                telegramInstance,
                'send',
                {
                    text: validatedTextToSend,
                    chatId,
                    parse_mode: parse_modeType,
                },
                (res: any) => telegramLogger(res),
            );
            return;
        }

        adapter.sendTo(
            telegramInstance,
            'send',
            {
                chatId,
                parse_mode: parse_modeType,
                text: await checkStatusInfo(validatedTextToSend),
                reply_markup: {
                    keyboard,
                    resize_keyboard,
                    one_time_keyboard,
                },
            },
            (res: any) => telegramLogger(res),
        );
    } catch (e: any) {
        errorLogger('Error sendToTelegram:', e, adapter);
    }
}

function sendToTelegramSubmenu(
    user: string,
    textToSend: string,
    keyboard: Keyboard,
    instance = defaultTelegramInstance,
    userListWithChatID: UserListWithChatId[],
    parse_mode?: boolean,
): void {
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
    instance: string,
    userListWithChatID: UserListWithChatId[],
): Promise<void> => {
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
        errorLogger('Error sendLocationToTelegram:', e, adapter);
    }
};

function telegramLogger(res: any): void {
    adapter.log.debug(`Sent Value to ${jsonString(res)} users!`);
}

export { sendToTelegram, sendToTelegramSubmenu, sendLocationToTelegram };
