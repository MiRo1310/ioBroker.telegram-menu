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
var import_logging = require("@b/app/logging");
var import_utilities = require("@b/lib/utilities");
var import_utils = require("@b/lib/utils");
var import_string = require("@b/lib/string");
var import_appUtils = require("@b/lib/appUtils");
var import_instance = require("@b/app/instance");
function validateTextToSend(adapter, textToSend) {
  if (!textToSend || (0, import_string.isEmptyString)(textToSend)) {
    adapter.log.error("There is a problem! Text to send is empty or undefined, please check your configuration.");
    return false;
  }
  if (textToSend.includes("change{")) {
    adapter.log.warn(
      "To use 'change{'. The status must have a param to be exchanged, like: {status:'ID':true}. If you use it in another way, and it doesn't work, please check your configuration. If nothing helps, please open an issue on GitHub."
    );
  }
  return true;
}
async function sendToTelegram({
  instance,
  userToSend,
  textToSend,
  keyboard,
  telegramParams,
  parse_mode
}) {
  const { resize_keyboard, one_time_keyboard, userListWithChatID, adapter } = telegramParams;
  try {
    const chatId = (0, import_utils.getChatID)(userListWithChatID, userToSend);
    if (!instance || !(0, import_instance.isInstanceActive)(telegramParams.telegramInstanceList, instance)) {
      return;
    }
    adapter.log.debug(
      `Send to: { user: ${userToSend} , chatId :${chatId} , text: ${textToSend} , instance: ${instance} , userListWithChatID: ${(0, import_string.jsonString)(userListWithChatID)} , parseMode: ${parse_mode} }`
    );
    validateTextToSend(adapter, textToSend);
    if (!keyboard) {
      adapter.sendTo(
        instance,
        "send",
        {
          text: (0, import_string.cleanUpString)(textToSend),
          chatId,
          parse_mode: (0, import_appUtils.getParseMode)(parse_mode)
        },
        (res) => telegramLogger(adapter, res)
      );
      return;
    }
    adapter.sendTo(
      instance,
      "send",
      {
        chatId,
        parse_mode: (0, import_appUtils.getParseMode)(parse_mode),
        text: await (0, import_utilities.textModifier)(adapter, (0, import_string.cleanUpString)(textToSend)),
        reply_markup: {
          keyboard,
          resize_keyboard,
          one_time_keyboard
        }
      },
      (res) => telegramLogger(adapter, res)
    );
  } catch (e) {
    (0, import_logging.errorLogger)("Error sendToTelegram:", e, adapter);
  }
}
function sendToTelegramSubmenu(telegramInstance, user, textToSend, keyboard, telegramParams, parse_mode) {
  const { userListWithChatID, adapter } = telegramParams;
  if (!validateTextToSend(adapter, textToSend)) {
    return;
  }
  adapter.sendTo(
    telegramInstance,
    "send",
    {
      chatId: (0, import_utils.getChatID)(userListWithChatID, user),
      parse_mode: (0, import_appUtils.getParseMode)(parse_mode),
      text: (0, import_string.cleanUpString)(textToSend),
      reply_markup: keyboard
    },
    (res) => telegramLogger(adapter, res)
  );
}
const sendLocationToTelegram = async (telegramInstance, user, data, telegramParams) => {
  const { userListWithChatID, adapter } = telegramParams;
  try {
    const chatId = (0, import_utils.getChatID)(userListWithChatID, user);
    for (const { longitude: longitudeID, latitude: latitudeID } of data) {
      if (!(latitudeID || longitudeID)) {
        continue;
      }
      const latitude = await adapter.getForeignStateAsync(latitudeID);
      const longitude = await adapter.getForeignStateAsync(longitudeID);
      if (!latitude || !longitude) {
        continue;
      }
      adapter.sendTo(
        telegramInstance,
        {
          chatId,
          latitude: latitude.val,
          longitude: longitude.val,
          disable_notification: true
        },
        (res) => telegramLogger(adapter, res)
      );
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error send location to telegram:", e, adapter);
  }
};
function telegramLogger(adapter, res) {
  adapter.log.debug(`Telegram response : "${(0, import_string.jsonString)(res)}"`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendLocationToTelegram,
  sendToTelegram,
  sendToTelegramSubmenu
});
//# sourceMappingURL=telegram.js.map
