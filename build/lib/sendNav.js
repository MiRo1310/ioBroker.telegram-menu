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
var sendNav_exports = {};
__export(sendNav_exports, {
  sendNav: () => sendNav
});
module.exports = __toCommonJS(sendNav_exports);
var import_console = require("console");
var import_logging = require("./logging");
var import_telegram = require("./telegram");
var import_utilities = require("./utilities");
async function sendNav(part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
  try {
    if (userToSend) {
      (0, import_logging.debug)([{ text: "Send Nav to Telegram" }]);
      const nav = part.nav;
      const text = await (0, import_utilities.checkStatusInfo)(part.text);
      await (0, import_telegram.sendToTelegram)(
        userToSend,
        text,
        nav,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        part.parse_mode || "false"
      );
    }
  } catch (e) {
    (0, import_console.error)([
      { text: "Error sendNav:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendNav
});
//# sourceMappingURL=sendNav.js.map
