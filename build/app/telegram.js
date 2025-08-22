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
var import_instance = require("./instance");
function validateTextToSend(textToSend) {
  if (!textToSend || (0, import_string.isEmptyString)(textToSend)) {
    import_main.adapter.log.error("There is a problem! Text to send is empty or undefined, please check your configuration.");
    return false;
  }
  if (textToSend.includes("change{")) {
    import_main.adapter.log.warn(
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
  try {
    const { resize_keyboard, one_time_keyboard, userListWithChatID } = telegramParams;
    const chatId = (0, import_utils.getChatID)(userListWithChatID, userToSend);
    if (!instance || !(0, import_instance.isInstanceActive)(telegramParams.telegramInstanceList, instance)) {
      return;
    }
    import_main.adapter.log.debug(
      `Send to: { user: ${userToSend} , chatId :${chatId} , text: ${textToSend} , instance: ${instance} , userListWithChatID: ${(0, import_string.jsonString)(userListWithChatID)} , parseMode: ${parse_mode} }`
    );
    validateTextToSend(textToSend);
    if (!keyboard) {
      import_main.adapter.sendTo(
        instance,
        "send",
        {
          text: (0, import_string.cleanUpString)(textToSend),
          chatId,
          parse_mode: (0, import_appUtils.getParseMode)(parse_mode)
        },
        (res) => telegramLogger(res)
      );
      return;
    }
    import_main.adapter.sendTo(
      instance,
      "send",
      {
        chatId,
        parse_mode: (0, import_appUtils.getParseMode)(parse_mode),
        text: await (0, import_utilities.returnTextModifier)((0, import_string.cleanUpString)(textToSend)),
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
function sendToTelegramSubmenu(telegramInstance, user, textToSend, keyboard, telegramParams, parse_mode) {
  const { userListWithChatID } = telegramParams;
  if (!validateTextToSend(textToSend)) {
    return;
  }
  import_main.adapter.sendTo(
    telegramInstance,
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
const sendLocationToTelegram = async (telegramInstance, user, data, telegramParams) => {
  const { userListWithChatID } = telegramParams;
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
        telegramInstance,
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
    (0, import_logging.errorLogger)("Error send location to telegram:", e, import_main.adapter);
  }
};
function telegramLogger(res) {
  import_main.adapter.log.debug(`Telegram response : "${(0, import_string.jsonString)(res)}"`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendLocationToTelegram,
  sendToTelegram,
  sendToTelegramSubmenu
});
//# sourceMappingURL=telegram.js.map
