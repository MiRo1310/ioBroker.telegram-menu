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
function validateTextToSend(textToSend) {
    if (!textToSend || (0, string_1.isEmptyString)(textToSend)) {
        main_1.adapter.log.error('There is a problem! Text to send is empty or undefined, please check your configuration.');
    }
}
async function sendToTelegram({ userToSend, textToSend, keyboard, telegramParams, parse_mode, }) {
    try {
        const { telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID } = telegramParams;
        const chatId = (0, utils_1.getChatID)(userListWithChatID, userToSend);
        main_1.adapter.log.debug(`Send to: { user: ${userToSend} , chatId :${chatId} , text: ${textToSend} , instance: ${telegramInstance} , userListWithChatID: ${(0, string_1.jsonString)(userListWithChatID)} , parseMode: ${parse_mode} }`);
        validateTextToSend(textToSend);
        if (!keyboard) {
            main_1.adapter.sendTo(telegramInstance, 'send', {
                text: (0, string_1.cleanUpString)(textToSend),
                chatId,
                parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
            }, res => telegramLogger(res));
            return;
        }
        main_1.adapter.sendTo(telegramInstance, 'send', {
            chatId,
            parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
            text: await (0, utilities_1.returnTextModifier)((0, string_1.cleanUpString)(textToSend)),
            reply_markup: {
                keyboard,
                resize_keyboard,
                one_time_keyboard,
            },
        }, res => telegramLogger(res));
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendToTelegram:', e, main_1.adapter);
    }
}
function sendToTelegramSubmenu(user, textToSend, keyboard, telegramParams, parse_mode) {
    const { telegramInstance: instance, userListWithChatID } = telegramParams;
    validateTextToSend(textToSend);
    main_1.adapter.sendTo(instance, 'send', {
        chatId: (0, utils_1.getChatID)(userListWithChatID, user),
        parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
        text: (0, string_1.cleanUpString)(textToSend),
        reply_markup: keyboard,
    }, (res) => telegramLogger(res));
}
const sendLocationToTelegram = async (user, data, telegramParams) => {
    const { userListWithChatID, telegramInstance: instance } = telegramParams;
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
        (0, logging_1.errorLogger)('Error send location to telegram:', e, main_1.adapter);
    }
};
exports.sendLocationToTelegram = sendLocationToTelegram;
function telegramLogger(res) {
    main_1.adapter.log.debug(`Telegram response : "${(0, string_1.jsonString)(res)}"`);
}
//# sourceMappingURL=telegram.js.map