"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNav = void 0;
const console_1 = require("console");
const logging_1 = require("./logging");
const telegram_1 = require("./telegram");
const utilities_1 = require("./utilities");
async function sendNav(part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
    try {
        if (userToSend) {
            (0, logging_1.debug)([{ text: "Send Nav to Telegram" }]);
            const nav = part.nav;
            const text = await (0, utilities_1.checkStatusInfo)(part.text);
            (0, telegram_1.sendToTelegram)(userToSend, text, nav, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part.parse_mode || "");
        }
    }
    catch (e) {
        (0, console_1.error)([{ text: "Error sendNav:", val: e.message }, { text: "Stack:", val: e.stack }]);
    }
}
exports.sendNav = sendNav;
//# sourceMappingURL=sendNav.js.map