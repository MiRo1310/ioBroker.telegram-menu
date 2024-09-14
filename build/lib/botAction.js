"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var botAction_exports = {};
__export(botAction_exports, {
  deleteMessageByBot: () => deleteMessageByBot
});
module.exports = __toCommonJS(botAction_exports);
var import_main = __toESM(require("../main"));
var import_logging = require("./logging");
const deleteMessageByBot = async (instance, user, userListWithChatID, messageId, chat_id) => {
  const _this = import_main.default.getInstance();
  try {
    if (chat_id) {
      (0, import_logging.debug)([{ text: "Delete Message for", val: user + " " + chat_id + " , MessageId: " + messageId }]);
    }
    _this.sendTo(instance, {
      deleteMessage: {
        options: {
          chat_id,
          message_id: messageId
        }
      }
    });
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error deleteMessage:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteMessageByBot
});
//# sourceMappingURL=botAction.js.map
