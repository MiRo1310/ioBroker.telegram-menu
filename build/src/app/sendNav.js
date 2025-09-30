"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNav = void 0;
const telegram_1 = require("./telegram");
const utilities_1 = require("../lib/utilities");
const main_1 = require("../main");
const logging_1 = require("./logging");
async function sendNav(instance, part, userToSend, telegramParams) {
    try {
        if (userToSend) {
            const { nav: keyboard, text, parse_mode } = part;
            const textToSend = await (0, utilities_1.textModifier)(text ?? '');
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
exports.sendNav = sendNav;
//# sourceMappingURL=sendNav.js.map