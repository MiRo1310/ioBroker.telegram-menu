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
var botAction_exports = {};
__export(botAction_exports, {
  deleteMessageByBot: () => deleteMessageByBot
});
module.exports = __toCommonJS(botAction_exports);
var import_main = require("../main");
var import_logging = require("./logging");
const deleteMessageByBot = (instance, user, userListWithChatID, messageId, chat_id) => {
  try {
    if (chat_id) {
      import_main._this.log.debug(`Delete Message for ${user} ${chat_id} , MessageId: ${messageId}`);
    }
    import_main._this.sendTo(instance, {
      deleteMessage: {
        options: {
          chat_id,
          message_id: messageId
        }
      }
    });
  } catch (e) {
    (0, import_logging.errorLogger)("Error deleteMessage:", e);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteMessageByBot
});
//# sourceMappingURL=botAction.js.map
