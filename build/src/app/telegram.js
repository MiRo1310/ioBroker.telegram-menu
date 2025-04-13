"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLocationToTelegram = void 0;
exports.sendToTelegram = sendToTelegram;
exports.sendToTelegramSubmenu = sendToTelegramSubmenu;
const logging_1 = require("./logging");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const utils_1 = require("../lib/utils");
const string_1 = require("../lib/string");
const appUtils_1 = require("../lib/appUtils");
async function sendToTelegram({ userToSend = '', textToSend, keyboard, instanceTelegram = 'telegram.0', resizeKeyboard = true, oneTimeKeyboard = true, userListWithChatID, parseMode = false, }) {
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, userToSend);
        const parseModeType = (0, appUtils_1.getParseMode)(parseMode);
        main_1.adapter.log.debug(`Send to: ${userToSend} => ${textToSend}`);
        main_1.adapter.log.debug(`Instance: ${instanceTelegram}`);
        main_1.adapter.log.debug(`UserListWithChatID	: ${(0, string_1.jsonString)(userListWithChatID)}`);
        main_1.adapter.log.debug(`Parse_mode	: ${parseMode}`);
        main_1.adapter.log.debug(`ChatId	: ${chatId}`);
        main_1.adapter.log.debug(`ParseModeType: ${parseModeType}`);
        textToSend = (0, string_1.validateNewLine)(textToSend);
        if (!keyboard) {
            main_1.adapter.log.debug('No Keyboard');
            main_1.adapter.sendTo(instanceTelegram, 'send', {
                text: textToSend,
                chatId,
                parseMode: parseModeType,
            }, function (res) {
                main_1.adapter.log.debug(`Sent Value to ${(0, string_1.jsonString)(res)} users!`);
            });
        }
        else {
            const text = await (0, utilities_1.checkStatusInfo)(textToSend);
            main_1.adapter.sendTo(instanceTelegram, 'send', {
                chatId: chatId,
                parseMode: parseModeType,
                text: text,
                reply_markup: {
                    keyboard: keyboard,
                    resizeKeyboard: resizeKeyboard,
                    oneTimeKeyboard: oneTimeKeyboard,
                },
            }, function (res) {
                main_1.adapter.log.debug(`Sent Value to ${(0, string_1.jsonString)(res)} users!`);
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendToTelegram:', e, main_1.adapter);
    }
}
function sendToTelegramSubmenu(user, textToSend, keyboard, instance = 'telegram.0', userListWithChatID, parseMode) {
    const parseModeType = (0, appUtils_1.getParseMode)(parseMode);
    main_1.adapter.log.debug(`Send this ParseMode: ${parseModeType}`);
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, user);
        textToSend = (0, string_1.validateNewLine)(textToSend);
        main_1.adapter.sendTo(instance, 'send', {
            chatId: chatId,
            parseMode: parseModeType,
            text: textToSend,
            reply_markup: keyboard,
        });
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendToTelegramSubmenu:', e, main_1.adapter);
    }
}
const sendLocationToTelegram = async (user, data, instance, userListWithChatID) => {
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, user);
        for (const { longitude: longitudeID, latitude: latitudeID } of data) {
            if (!(latitudeID || longitudeID)) {
                continue;
            }
            const latitude = await main_1.adapter.getForeignStateAsync(latitudeID);
            const longitude = await main_1.adapter.getForeignStateAsync(longitudeID);
            if (!latitude || !longitude) {
                continue;
            }
            main_1.adapter.sendTo(instance, {
                chatId: chatId,
                latitude: latitude.val,
                longitude: longitude.val,
                disable_notification: true,
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendLocationToTelegram:', e, main_1.adapter);
    }
};
exports.sendLocationToTelegram = sendLocationToTelegram;
//# sourceMappingURL=telegram.js.map