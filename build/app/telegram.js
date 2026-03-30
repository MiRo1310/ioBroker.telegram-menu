"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLocationToTelegram = void 0;
exports.sendToTelegram = sendToTelegram;
exports.sendToTelegramSubmenu = sendToTelegramSubmenu;
const logging_1 = require("../app/logging");
const utilities_1 = require("../lib/utilities");
const utils_1 = require("../lib/utils");
const string_1 = require("../lib/string");
const appUtils_1 = require("../lib/appUtils");
const instance_1 = require("../app/instance");
function validateTextToSend(adapter, textToSend) {
    if (!textToSend || (0, string_1.isEmptyString)(textToSend)) {
        adapter.log.error('There is a problem! Text to send is empty or undefined, please check your configuration.');
        return false;
    }
    if (textToSend.includes('change{')) {
        adapter.log.warn("To use 'change{'. The status must have a param to be exchanged, like: {status:'ID':true}. If you use it in another way, and it doesn't work, please check your configuration. If nothing helps, please open an issue on GitHub.");
    }
    return true;
}
async function sendToTelegram({ instance, userToSend, textToSend, keyboard, telegramParams, parse_mode, }) {
    const { resize_keyboard, one_time_keyboard, userListWithChatID, adapter } = telegramParams;
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, userToSend);
        if (!instance || !(0, instance_1.isInstanceActive)(telegramParams.telegramInstanceList, instance)) {
            return;
        }
        adapter.log.debug(`Send to: { user: ${userToSend} , chatId :${chatId} , text: ${textToSend} , instance: ${instance} , parseMode: ${parse_mode} }`);
        validateTextToSend(adapter, textToSend);
        if (!keyboard) {
            adapter.sendTo(instance, 'send', {
                text: (0, string_1.cleanUpString)(textToSend),
                chatId,
                parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
            }, res => telegramLogger(adapter, res));
            return;
        }
        adapter.sendTo(instance, 'send', {
            chatId,
            parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
            text: await (0, utilities_1.textModifier)(adapter, (0, string_1.cleanUpString)(textToSend)),
            reply_markup: {
                keyboard,
                resize_keyboard,
                one_time_keyboard,
            },
        }, res => telegramLogger(adapter, res));
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendToTelegram:', e, adapter);
    }
}
function sendToTelegramSubmenu(telegramInstance, user, textToSend, keyboard, telegramParams, parse_mode) {
    const { userListWithChatID, adapter } = telegramParams;
    if (!validateTextToSend(adapter, textToSend)) {
        return;
    }
    adapter.sendTo(telegramInstance, 'send', {
        chatId: (0, utils_1.getChatID)(userListWithChatID, user),
        parse_mode: (0, appUtils_1.getParseMode)(parse_mode),
        text: (0, string_1.cleanUpString)(textToSend),
        reply_markup: keyboard,
    }, (res) => telegramLogger(adapter, res));
}
const sendLocationToTelegram = async (telegramInstance, user, data, telegramParams) => {
    const { userListWithChatID, adapter } = telegramParams;
    try {
        const chatId = (0, utils_1.getChatID)(userListWithChatID, user);
        for (const { longitude: longitudeID, latitude: latitudeID } of data) {
            if (!(latitudeID || longitudeID)) {
                continue;
            }
            const latitude = await adapter.getForeignStateAsync(latitudeID);
            const longitude = await adapter.getForeignStateAsync(longitudeID);
            if (!latitude || !longitude) {
                continue;
            }
            adapter.sendTo(telegramInstance, {
                chatId: chatId,
                latitude: latitude.val,
                longitude: longitude.val,
                disable_notification: true,
            }, (res) => telegramLogger(adapter, res));
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error send location to telegram:', e, adapter);
    }
};
exports.sendLocationToTelegram = sendLocationToTelegram;
function telegramLogger(adapter, res) {
    adapter.log.debug(`Telegram response : "${(0, string_1.jsonString)(res)}"`);
}
//# sourceMappingURL=telegram.js.map