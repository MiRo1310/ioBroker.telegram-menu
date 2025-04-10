import { errorLogger } from './logging';
import { checkStatusInfo, newLine } from '../lib/utilities';
import { _this } from '../main';
import type { BooleanString, Keyboard, Location, ParseModeType, UserListWithChatId } from '../types/types';
import { isTruthy } from './global';
import { getChatID } from '../lib/utils';
import { jsonString } from '../lib/string';

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
    textToSend: string;
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

        _this.log.debug(`Send to: ${user} => ${textToSend}`);
        _this.log.debug(`Instance: ${instance}`);
        _this.log.debug(`UserListWithChatID	: ${jsonString(userListWithChatID)}`);
        _this.log.debug(`Parse_mode	: ${parse_mode}`);
        _this.log.debug(`ChatId	: ${chatId}`);
        _this.log.debug(`ParseModeType: ${parse_modeType}`);

        textToSend = newLine(textToSend);
        if (!keyboard) {
            _this.log.debug('No Keyboard');
            _this.sendTo(
                instance,
                'send',
                {
                    text: textToSend,
                    chatId: chatId,
                    parse_mode: parse_modeType,
                },
                function (res: any) {
                    _this.log.debug(`Sent Value to ${jsonString(res)} users!`);
                },
            );
        } else {
            const text = await checkStatusInfo(textToSend);
            _this.sendTo(
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
                    _this.log.debug(`Sent Value to ${jsonString(res)} users!`);
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
    _this.log.debug(`Send this ParseMode: ${parseModeType}`);
    try {
        const chatId = getChatID(userListWithChatID, user);
        textToSend = newLine(textToSend);
        _this.sendTo(instance, 'send', {
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

            const latitude = await _this.getForeignStateAsync(element.latitude);
            const longitude = await _this.getForeignStateAsync(element.longitude);
            if (!latitude || !longitude) {
                continue;
            }
            _this.sendTo(instance, {
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
