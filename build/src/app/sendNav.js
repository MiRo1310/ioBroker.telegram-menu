"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNav = sendNav;
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const logging_1 = require("./logging");
async function sendNav(instance, part, userToSend, telegramParams) {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await (0, utilities_1.textModifier)(main_1.adapter, text ?? '');
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend,
                keyboard,
                telegramParams,
                parse_mode,
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error sendNav:', e, main_1.adapter);
    }
}
//# sourceMappingURL=sendNav.js.map