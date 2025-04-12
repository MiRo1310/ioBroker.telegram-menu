import { errorLogger } from './logging';
import { checkStatusInfo } from '../lib/utilities';
import { adapter } from '../main';
import type { BooleanString, Keyboard, Location, ParseModeType, UserListWithChatId } from '../types/types';
import { isTruthy } from './global';
import { getChatID } from '../lib/utils';
import { jsonString, validateNewLine } from '../lib/string';

async function sendToTelegram({
    user = '',
    textToSend,
    keyboard,
    instance = 'telegram.0',
    resize_keyboard = true,
    one_time_keyboard = true,
    userListWithChatID,
    parse_mode,
}: {
    user: string;
    textToSend?: string;
    keyboard?: Keyboard;
    instance: string;
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
    userListWithChatID: UserListWithChatId[];
    parse_mode: BooleanString;
}): Promise<void> {
    try {
        const chatId = getChatID(userListWithChatID, user);
        const parse_modeType: ParseModeType = getParseMode(parse_mode);

        adapter.log.debug(`Send to: ${user} => ${textToSend}`);
        adapter.log.debug(`Instance: ${instance}`);
        adapter.log.debug(`UserListWithChatID	: ${jsonString(userListWithChatID)}`);
        adapter.log.debug(`Parse_mode	: ${parse_mode}`);
        adapter.log.debug(`ChatId	: ${chatId}`);
        adapter.log.debug(`ParseModeType: ${parse_modeType}`);

        textToSend = validateNewLine(textToSend);
        if (!keyboard) {
            adapter.log.debug('No Keyboard');
            adapter.sendTo(
                instance,
                'send',
                {
                    text: textToSend,
                    chatId: chatId,
                    parse_mode: parse_modeType,
                },
                function (res: any) {
                    adapter.log.debug(`Sent Value to ${jsonString(res)} users!`);
                },
            );
        } else {
            const text = await checkStatusInfo(textToSend);
            adapter.sendTo(
                instance,
                'send',
                {
                    chatId: chatId,
                    parse_mode: parse_modeType,
                    text: text,
                    reply_markup: {
                        keyboard: keyboard,
                        resize_keyboard: resize_keyboard,
                        one_time_keyboard: one_time_keyboard,
                    },
                },
                function (res: any) {
                    adapter.log.debug(`Sent Value to ${jsonString(res)} users!`);
                },
            );
        }
    } catch (e: any) {
        errorLogger('Error sendToTelegram:', e);
    }
}

function sendToTelegramSubmenu(
    user: string,
    textToSend: string,
    keyboard: Keyboard,
    instance = 'telegram.0',
    userListWithChatID: UserListWithChatId[],
    parse_mode: BooleanString,
): void {
    const parseModeType = getParseMode(parse_mode);
    adapter.log.debug(`Send this ParseMode: ${parseModeType}`);
    try {
        const chatId = getChatID(userListWithChatID, user);
        textToSend = validateNewLine(textToSend);
        adapter.sendTo(instance, 'send', {
            chatId: chatId,
            parse_mode: parseModeType,
            text: textToSend,
            reply_markup: keyboard,
        });
    } catch (e: any) {
        errorLogger('Error sendToTelegramSubmenu:', e);
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
        for (const element of data) {
            if (!(element.latitude || element.longitude)) {
                continue;
            }

            const latitude = await adapter.getForeignStateAsync(element.latitude);
            const longitude = await adapter.getForeignStateAsync(element.longitude);
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
        errorLogger('Error sendLocationToTelegram:', e);
    }
};

function getParseMode(val: BooleanString | boolean): ParseModeType {
    if (isTruthy(val)) {
        return 'HTML';
    }
    return 'Markdown';
}

export { sendToTelegram, sendToTelegramSubmenu, sendLocationToTelegram };
