"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNav = sendNav;
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const logging_1 = require("./logging");
async function sendNav(part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
    try {
        if (userToSend) {
            main_1._this.log.debug('Send Nav to Telegram');
            const nav = part.nav;
            const text = await (0, utilities_1.checkStatusInfo)(part.text);
            await (0, telegram_1.sendToTelegram)({
                user: userToSend,
                textToSend: text,
                keyboard: nav,
                instance: instanceTelegram,
                resize_keyboard: resize_keyboard,
                one_time_keyboard: one_time_keyboard,
                userListWithChatID: userListWithChatID,
                parse_mode: part.parse_mode || 'false',
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendNav:', e);
    }
}
