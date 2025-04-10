"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var telegram_exports = {};
__export(telegram_exports, {
  sendLocationToTelegram: () => sendLocationToTelegram,
  sendToTelegram: () => sendToTelegram,
  sendToTelegramSubmenu: () => sendToTelegramSubmenu
});
module.exports = __toCommonJS(telegram_exports);
var import_logging = require("./logging");
var import_utilities = require("../lib/utilities");
var import_main = require("../main");
var import_global = require("./global");
var import_utils = require("../lib/utils");
async function sendToTelegram({
  user = "",
  textToSend,
  keyboard,
  instance = "telegram.0",
  resize_keyboard = true,
  one_time_keyboard = true,
  userListWithChatID,
  parse_mode
}) {
  try {
    const chatId = (0, import_utils.getChatID)(userListWithChatID, user);
    const parse_modeType = getParseMode(parse_mode);
    (0, import_logging.debug)([
      { text: `Send to: ${user} => ${textToSend}` },
      { text: "Instance:", val: instance },
      { text: "UserListWithChatID	:", val: userListWithChatID },
      { text: "Parse_mode	:", val: parse_mode },
      { text: "ChatId	:", val: chatId },
      { text: "ParseModeType:", val: parse_modeType }
    ]);
    textToSend = (0, import_utilities.newLine)(textToSend);
    if (!keyboard) {
      import_main._this.log.debug("No Keyboard");
      import_main._this.sendTo(
        instance,
        "send",
        {
          text: textToSend,
          chatId,
          parse_mode: parse_modeType
        },
        function(res) {
          import_main._this.log.debug(`Sent Value to ${JSON.stringify(res)} users!`);
        }
      );
    } else {
      const text = await (0, import_utilities.checkStatusInfo)(textToSend);
      import_main._this.sendTo(
        instance,
        "send",
        {
          chatId,
          parse_mode: parse_modeType,
          text,
          reply_markup: {
            keyboard,
            resize_keyboard,
            one_time_keyboard
          }
        },
        function(res) {
          (0, import_logging.debug)([{ text: `Sent Value to ${res} users!` }]);
        }
      );
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error sendToTelegram:", e);
  }
}
function sendToTelegramSubmenu(user, textToSend, keyboard, instance = "telegram.0", userListWithChatID, parse_mode) {
  const parseModeType = getParseMode(parse_mode);
  (0, import_logging.debug)([{ text: "Send this ParseMode:", val: parseModeType }]);
  try {
    const chatId = (0, import_utils.getChatID)(userListWithChatID, user);
    textToSend = (0, import_utilities.newLine)(textToSend);
    import_main._this.sendTo(instance, "send", {
      chatId,
      parse_mode: parseModeType,
      text: textToSend,
      reply_markup: keyboard
    });
  } catch (e) {
    (0, import_logging.errorLogger)("Error sendToTelegramSubmenu:", e);
  }
}
const sendLocationToTelegram = async (user, data, instance, userListWithChatID) => {
  try {
    const chatId = (0, import_utils.getChatID)(userListWithChatID, user);
    for (const element of data) {
      if (!(element.latitude || element.longitude)) {
        continue;
      }
      const latitude = await import_main._this.getForeignStateAsync(element.latitude);
      const longitude = await import_main._this.getForeignStateAsync(element.longitude);
      if (!latitude || !longitude) {
        continue;
      }
      import_main._this.sendTo(instance, {
        chatId,
        latitude: latitude.val,
        longitude: longitude.val,
        disable_notification: true
      });
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error sendLocationToTelegram:", e);
  }
};
function getParseMode(val) {
  if ((0, import_global.isTruthy)(val)) {
    return "HTML";
  }
  return "Markdown";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendLocationToTelegram,
  sendToTelegram,
  sendToTelegramSubmenu
});
//# sourceMappingURL=telegram.js.map
