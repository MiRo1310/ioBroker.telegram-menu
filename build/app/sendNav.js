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
var import_telegram = require("./telegram");
var import_utilities = require("../lib/utilities");
var import_main = require("../main");
var import_logging = require("./logging");
async function sendNav(instance, part, userToSend, telegramParams) {
  try {
    if (userToSend) {
      const { nav: keyboard, text, parse_mode } = part;
      const textToSend = await (0, import_utilities.textModifier)(import_main.adapter, text != null ? text : "");
      await (0, import_telegram.sendToTelegram)({
        instance,
        userToSend,
        textToSend,
        keyboard,
        telegramParams,
        parse_mode
      });
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error sendNav:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendNav
});
//# sourceMappingURL=sendNav.js.map
