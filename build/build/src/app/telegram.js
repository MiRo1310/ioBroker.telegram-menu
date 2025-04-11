"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLocationToTelegram = void 0;
exports.sendToTelegram = sendToTelegram;
exports.sendToTelegramSubmenu = sendToTelegramSubmenu;
const logging_1 = require("./logging");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const global_1 = require("./global");
const utils_1 = require("../lib/utils");
const string_1 = require("../lib/string");
async function sendToTelegram({ user = '', textToSend, keyboard, instance = 'telegram.0', resize_keyboard = true, one_time_keyboard = true, userListWithChatID, parse_mode, }) {
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, user);
        const parse_modeType = getParseMode(parse_mode);
        main_1._this.log.debug(`Send to: ${user} => ${textToSend}`);
        main_1._this.log.debug(`Instance: ${instance}`);
        main_1._this.log.debug(`UserListWithChatID	: ${(0, string_1.jsonString)(userListWithChatID)}`);
        main_1._this.log.debug(`Parse_mode	: ${parse_mode}`);
        main_1._this.log.debug(`ChatId	: ${chatId}`);
        main_1._this.log.debug(`ParseModeType: ${parse_modeType}`);
        textToSend = (0, string_1.validateNewLine)(textToSend);
        if (!keyboard) {
            main_1._this.log.debug('No Keyboard');
            main_1._this.sendTo(instance, 'send', {
                text: textToSend,
                chatId: chatId,
                parse_mode: parse_modeType,
            }, function (res) {
                main_1._this.log.debug(`Sent Value to ${(0, string_1.jsonString)(res)} users!`);
            });
        }
        else {
            const text = await (0, utilities_1.checkStatusInfo)(textToSend);
            main_1._this.sendTo(instance, 'send', {
                chatId: chatId,
                parse_mode: parse_modeType,
                text: text,
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                },
            }, function (res) {
                main_1._this.log.debug(`Sent Value to ${(0, string_1.jsonString)(res)} users!`);
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendToTelegram:', e);
    }
}
function sendToTelegramSubmenu(user, textToSend, keyboard, instance = 'telegram.0', userListWithChatID, parse_mode) {
    const parseModeType = getParseMode(parse_mode);
    main_1._this.log.debug(`Send this ParseMode: ${parseModeType}`);
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, user);
        textToSend = (0, string_1.validateNewLine)(textToSend);
        main_1._this.sendTo(instance, 'send', {
            chatId: chatId,
            parse_mode: parseModeType,
            text: textToSend,
            reply_markup: keyboard,
        });
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendToTelegramSubmenu:', e);
    }
}
const sendLocationToTelegram = async (user, data, instance, userListWithChatID) => {
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, user);
        for (const element of data) {
            if (!(element.latitude || element.longitude)) {
                continue;
            }
            const latitude = await main_1._this.getForeignStateAsync(element.latitude);
            const longitude = await main_1._this.getForeignStateAsync(element.longitude);
            if (!latitude || !longitude) {
                continue;
            }
            main_1._this.sendTo(instance, {
                chatId: chatId,
                latitude: latitude.val,
                longitude: longitude.val,
                disable_notification: true,
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendLocationToTelegram:', e);
    }
};
exports.sendLocationToTelegram = sendLocationToTelegram;
function getParseMode(val) {
    if ((0, global_1.isTruthy)(val)) {
        return 'HTML';
    }
    return 'Markdown';
}
