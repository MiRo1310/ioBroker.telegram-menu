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
const config_1 = require("../config/config");
async function sendToTelegram({ userToSend = '', textToSend, keyboard, telegramInstance = config_1.defaultTelegramInstance, resize_keyboard = true, one_time_keyboard = true, userListWithChatID, parse_mode = false, }) {
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, userToSend);
        main_1.adapter.log.debug(`Send to: ${userToSend} => ${textToSend}`);
        main_1.adapter.log.debug(`Instance: ${telegramInstance}`);
        main_1.adapter.log.debug(`UserListWithChatID	: ${(0, string_1.jsonString)(userListWithChatID)}`);
        main_1.adapter.log.debug(`Parse_mode	: ${parse_mode}`);
        main_1.adapter.log.debug(`ChatId	: ${chatId}`);
        main_1.adapter.log.debug(`ParseMode: ${parse_mode}`);
        const validatedTextToSend = (0, string_1.cleanUpString)(textToSend ?? '');
        if (!keyboard) {
            main_1.adapter.sendTo(telegramInstance, 'send', {
                text: validatedTextToSend,
                chatId,
                parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
            }, (res) => telegramLogger(res));
            return;
        }
        main_1.adapter.sendTo(telegramInstance, 'send', {
            chatId,
            parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
            text: await (0, utilities_1.checkStatusInfo)(validatedTextToSend),
            reply_markup: {
                keyboard,
                resize_keyboard,
                one_time_keyboard,
            },
        }, (res) => telegramLogger(res));
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendToTelegram:', e, main_1.adapter);
    }
}
function sendToTelegramSubmenu(user, textToSend, keyboard, instance = config_1.defaultTelegramInstance, userListWithChatID, parse_mode) {
    main_1.adapter.sendTo(instance, 'send', {
        chatId: (0, utils_1.getChatID)(userListWithChatID, user),
        parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
        text: (0, string_1.cleanUpString)(textToSend),
        reply_markup: keyboard,
    }, (res) => telegramLogger(res));
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
            }, (res) => telegramLogger(res));
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendLocationToTelegram:', e, main_1.adapter);
    }
};
exports.sendLocationToTelegram = sendLocationToTelegram;
function telegramLogger(res) {
    main_1.adapter.log.debug(`Sent Value to ${(0, string_1.jsonString)(res)} users!`);
}
//# sourceMappingURL=telegram.js.map