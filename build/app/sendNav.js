"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNav = sendNav;
const utilities_1 = require("../lib/utilities");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
async function sendNav(adapter, instance, part, userToSend, telegramParams) {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await (0, utilities_1.textModifier)(adapter, text ?? '');
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
        (0, logging_1.errorLogger)('Error sendNav:', e, adapter);
    }
}
//# sourceMappingURL=sendNav.js.map