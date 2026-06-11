"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNav = sendNav;
const utilities_1 = require("../lib/utilities");
const telegram_1 = require("../app/telegram");
async function sendNav(appContext, instance, part, userToSend) {
    if (userToSend && part) {
        const { nav: keyboard, text, parse_mode } = part;
        const textToSend = await (0, utilities_1.textModifier)(appContext, text ?? '');
        await (0, telegram_1.sendToTelegram)({
            instance,
            userToSend,
            textToSend,
            keyboard,
            appContext,
            parse_mode,
        });
    }
}
//# sourceMappingURL=sendNav.js.map