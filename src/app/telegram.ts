import { errorLogger } from './logging';
import { checkStatusInfo } from '../lib/utilities';
import { adapter } from '../main';
import type { Keyboard, Location, ParseModeType, Telegram, UserListWithChatId } from '../types/types';
import { getChatID } from '../lib/utils';
import { jsonString, validateNewLine } from '../lib/string';
import { getParseMode } from '../lib/appUtils';

async function sendToTelegram({
    userToSend = '',
    textToSend,
    keyboard,
    instanceTelegram = 'telegram.0',
    resizeKeyboard = true,
    oneTimeKeyboard = true,
    userListWithChatID,
    parseMode = false,
}: Telegram): Promise<void> {
    try {
        const chatId = getChatID(userListWithChatID, userToSend);
        const parseModeType: ParseModeType = getParseMode(parseMode);

        adapter.log.debug(`Send to: ${userToSend} => ${textToSend}`);
        adapter.log.debug(`Instance: ${instanceTelegram}`);
        adapter.log.debug(`UserListWithChatID	: ${jsonString(userListWithChatID)}`);
        adapter.log.debug(`Parse_mode	: ${parseMode}`);
        adapter.log.debug(`ChatId	: ${chatId}`);
        adapter.log.debug(`ParseModeType: ${parseModeType}`);

        textToSend = validateNewLine(textToSend);
        if (!keyboard) {
            adapter.log.debug('No Keyboard');
            adapter.sendTo(
                instanceTelegram,
                'send',
                {
                    text: textToSend,
                    chatId,
                    parseMode: parseModeType,
                },
                function (res: any) {
                    adapter.log.debug(`Sent Value to ${jsonString(res)} users!`);
                },
            );
        } else {
            const text = await checkStatusInfo(textToSend);
            adapter.sendTo(
                instanceTelegram,
                'send',
                {
                    chatId: chatId,
                    parseMode: parseModeType,
                    text: text,
                    reply_markup: {
                        keyboard: keyboard,
                        resizeKeyboard: resizeKeyboard,
                        oneTimeKeyboard: oneTimeKeyboard,
                    },
                },
                function (res: any) {
                    adapter.log.debug(`Sent Value to ${jsonString(res)} users!`);
                },
            );
        }
    } catch (e: any) {
        errorLogger('Error sendToTelegram:', e, adapter);
    }
}

function sendToTelegramSubmenu(
    user: string,
    textToSend: string,
    keyboard: Keyboard,
    instance = 'telegram.0',
    userListWithChatID: UserListWithChatId[],
    parseMode?: boolean,
): void {
    const parseModeType = getParseMode(parseMode);
    adapter.log.debug(`Send this ParseMode: ${parseModeType}`);
    try {
        const chatId = getChatID(userListWithChatID, user);
        textToSend = validateNewLine(textToSend);
        adapter.sendTo(instance, 'send', {
            chatId: chatId,
            parseMode: parseModeType,
            text: textToSend,
            reply_markup: keyboard,
        });
    } catch (e: any) {
        errorLogger('Error sendToTelegramSubmenu:', e, adapter);
    }
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
            adapter.sendTo(instance, {
                chatId: chatId,
                latitude: latitude.val,
                longitude: longitude.val,
                disable_notification: true,
            });
        }
    } catch (e: any) {
        errorLogger('Error sendLocationToTelegram:', e, adapter);
    }
};

export { sendToTelegram, sendToTelegramSubmenu, sendLocationToTelegram };
