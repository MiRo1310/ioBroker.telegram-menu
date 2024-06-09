"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLocationToTelegram = exports.sendToTelegramSubmenu = exports.sendToTelegram = void 0;
const logging_1 = require("./logging");
const utilities_1 = require("./utilities");
const main_1 = __importDefault(require("../../main"));
async function sendToTelegram(user = "", textToSend, keyboard = [], instance = "telegram.0", resize_keyboard = true, one_time_keyboard = true, userListWithChatID, parse_mode) {
    try {
        const _this = main_1.default.getInstance();
        const chatId = (0, utilities_1.getChatID)(userListWithChatID, user);
        const parse_modeType = getParseMode(parse_mode);
        (0, logging_1.debug)([
            { text: `Send to: ${user} => ${textToSend}` },
            { text: "Instance:", val: instance },
            { text: "UserListWithChatID	:", val: userListWithChatID },
            { text: "Parse_mode	:", val: parse_mode },
            { text: "ChatId	:", val: chatId },
            { text: "ParseModeType:", val: parse_modeType },
        ]);
        textToSend = (0, utilities_1.newLine)(textToSend);
        if (keyboard.length == 0) {
            _this.sendTo(instance, "send", {
                text: textToSend,
                chatId: chatId,
                parse_mode: parse_modeType,
            }, function (res) {
                _this.log.debug("Sent Value to " + JSON.stringify(res) + " users!");
            });
        }
        else {
            const text = await (0, utilities_1.checkStatusInfo)(textToSend);
            _this.sendTo(instance, "send", {
                chatId: chatId,
                parse_mode: parse_modeType,
                text: text,
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                },
            }, function (res) {
                (0, logging_1.debug)([{ text: `Sent Value to ${res} users!` }]);
            });
        }
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error sendToTelegram:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.sendToTelegram = sendToTelegram;
function sendToTelegramSubmenu(user, textToSend, keyboard, instance = "telegram.0", userListWithChatID, parse_mode) {
    const _this = main_1.default.getInstance();
    const parseModeType = getParseMode(parse_mode);
    (0, logging_1.debug)([{ text: "Send this ParseMode:", val: parseModeType }]);
    try {
        const chatId = (0, utilities_1.getChatID)(userListWithChatID, user);
        textToSend = (0, utilities_1.newLine)(textToSend);
        _this.sendTo(instance, "send", {
            chatId: chatId,
            parse_mode: parseModeType,
            text: textToSend,
            reply_markup: keyboard,
        });
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error sendToTelegramSubmenu:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.sendToTelegramSubmenu = sendToTelegramSubmenu;
const sendLocationToTelegram = async (user, data, instance, userListWithChatID) => {
    const _this = main_1.default.getInstance();
    try {
        const chatId = (0, utilities_1.getChatID)(userListWithChatID, user);
        for (const element of data) {
            if (!(element.latitude || element.longitude))
                continue;
            const latitude = await _this.getForeignStateAsync(element.latitude);
            const longitude = await _this.getForeignStateAsync(element.longitude);
            if (!latitude || !longitude)
                continue;
            _this.sendTo(instance, {
                chatId: chatId,
                latitude: latitude.val,
                longitude: longitude.val,
                disable_notification: true,
            });
        }
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error sendLocationToTelegram:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
};
exports.sendLocationToTelegram = sendLocationToTelegram;
function getParseMode(val) {
    if (val === "true" || val === true) {
        return "HTML";
    }
    return "Markdown";
}
//# sourceMappingURL=telegram.js.map