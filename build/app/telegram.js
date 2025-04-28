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
var import_utils = require("../lib/utils");
var import_string = require("../lib/string");
var import_appUtils = require("../lib/appUtils");
var import_config = require("../config/config");
async function sendToTelegram({
  userToSend,
  textToSend,
  keyboard,
  telegramParams,
  userListWithChatID,
  parse_mode
}) {
  try {
    const { telegramInstance, resize_keyboard, one_time_keyboard } = telegramParams;
    const chatId = (0, import_utils.getChatID)(userListWithChatID, userToSend);
    import_main.adapter.log.debug(`Send to: ${userToSend} => ${textToSend}`);
    import_main.adapter.log.debug(`Instance: ${telegramInstance}`);
    import_main.adapter.log.debug(`UserListWithChatID	: ${(0, import_string.jsonString)(userListWithChatID)}`);
    import_main.adapter.log.debug(`Parse mode	: ${parse_mode}`);
    import_main.adapter.log.debug(`ChatId	: ${chatId}`);
    const validatedTextToSend = (0, import_string.cleanUpString)(textToSend != null ? textToSend : "");
    if (!keyboard) {
      import_main.adapter.sendTo(
        telegramInstance,
        "send",
        {
          text: validatedTextToSend,
          chatId,
          parse_mode: (0, import_appUtils.getParseMode)(parse_mode)
        },
        (res) => telegramLogger(res)
      );
      return;
    }
    import_main.adapter.sendTo(
      telegramInstance,
      "send",
      {
        chatId,
        parse_mode: (0, import_appUtils.getParseMode)(parse_mode),
        text: await (0, import_utilities.checkStatusInfo)(validatedTextToSend),
        reply_markup: {
          keyboard,
          resize_keyboard,
          one_time_keyboard
        }
      },
      (res) => telegramLogger(res)
    );
  } catch (e) {
    (0, import_logging.errorLogger)("Error sendToTelegram:", e, import_main.adapter);
  }
}
function sendToTelegramSubmenu(user, textToSend, keyboard, instance = import_config.defaultTelegramInstance, userListWithChatID, parse_mode) {
  import_main.adapter.sendTo(
    instance,
    "send",
    {
      chatId: (0, import_utils.getChatID)(userListWithChatID, user),
      parse_mode: (0, import_appUtils.getParseMode)(parse_mode),
      text: (0, import_string.cleanUpString)(textToSend),
      reply_markup: keyboard
    },
    (res) => telegramLogger(res)
  );
}
const sendLocationToTelegram = async (user, data, instance, userListWithChatID) => {
  try {
    const chatId = (0, import_utils.getChatID)(userListWithChatID, user);
    for (const { longitude: longitudeID, latitude: latitudeID } of data) {
      if (!(latitudeID || longitudeID)) {
        continue;
      }
      const latitude = await import_main.adapter.getForeignStateAsync(latitudeID);
      const longitude = await import_main.adapter.getForeignStateAsync(longitudeID);
      if (!latitude || !longitude) {
        continue;
      }
      import_main.adapter.sendTo(
        instance,
        {
          chatId,
          latitude: latitude.val,
          longitude: longitude.val,
          disable_notification: true
        },
        (res) => telegramLogger(res)
      );
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error sendLocationToTelegram:", e, import_main.adapter);
  }
};
function telegramLogger(res) {
  import_main.adapter.log.debug(`Sent Value to ${(0, import_string.jsonString)(res)} users!`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendLocationToTelegram,
  sendToTelegram,
  sendToTelegramSubmenu
});
//# sourceMappingURL=telegram.js.map
