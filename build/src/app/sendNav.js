"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNav = sendNav;
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const logging_1 = require("./logging");
async function sendNav(part, userToSend, telegramInstance, userListWithChatID, resize_keyboard, one_time_keyboard) {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await (0, utilities_1.checkStatusInfo)(text ?? '');
            await (0, telegram_1.sendToTelegram)({
                userToSend,
                textToSend,
                keyboard,
                telegramInstance,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
                parse_mode,
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendNav:', e, main_1.adapter);
    }
}
//# sourceMappingURL=sendNav.js.map