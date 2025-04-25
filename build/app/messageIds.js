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
var messageIds_exports = {};
__export(messageIds_exports, {
  deleteMessageIds: () => deleteMessageIds,
  saveMessageIds: () => saveMessageIds
});
module.exports = __toCommonJS(messageIds_exports);
var import_main = require("../main");
var import_botAction = require("./botAction");
var import_logging = require("./logging");
var import_utils = require("../lib/utils");
var import_string = require("../lib/string");
let isDeleting = false;
async function saveMessageIds(state, instanceTelegram) {
  var _a;
  try {
    let requestMessageId = {};
    let requestMessageIdObj = null;
    if (!isDeleting) {
      requestMessageIdObj = await import_main.adapter.getStateAsync("communication.requestIds");
    }
    isDeleting = false;
    const requestUserIdObj = await import_main.adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
    const request = await import_main.adapter.getForeignStateAsync(`${instanceTelegram}.communicate.request`);
    if (!(requestUserIdObj && requestUserIdObj.val)) {
      return;
    }
    requestMessageId = (requestMessageIdObj == null ? void 0 : requestMessageIdObj.val) ? JSON.parse(requestMessageIdObj == null ? void 0 : requestMessageIdObj.val.toString()) : {};
    if (!requestMessageId[requestUserIdObj.val.toString()]) {
      requestMessageId[requestUserIdObj.val.toString()] = [];
    }
    if (!((_a = requestMessageId[requestUserIdObj.val.toString()]) == null ? void 0 : _a.find((message) => message.id === state.val))) {
      requestMessageId[requestUserIdObj.val.toString()].push({
        id: state.val,
        time: Date.now(),
        request: request == null ? void 0 : request.val
      });
    }
    requestMessageId = removeOldMessageIds(requestMessageId, requestUserIdObj.val.toString());
    await import_main.adapter.setState("communication.requestIds", JSON.stringify(requestMessageId), true);
  } catch (e) {
    (0, import_logging.errorLogger)("Error saveMessageIds:", e, import_main.adapter);
  }
}
function removeOldMessageIds(messages, chatID) {
  messages[chatID] = messages[chatID].filter((message) => {
    return message.time && message.time > Date.now() - 1e3 * 60 * 60 * 24 * 2;
  });
  return messages;
}
const removeMessageFromList = ({
  element,
  chat_id,
  copyMessageIds
}) => {
  return copyMessageIds[chat_id].filter((message) => message.id !== element.id);
};
async function deleteMessageIds(user, userListWithChatID, instanceTelegram, whatShouldDelete) {
  try {
    const requestMessageIdObj = await import_main.adapter.getStateAsync("communication.requestIds");
    const lastMessageId = await import_main.adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);
    if (!requestMessageIdObj || typeof requestMessageIdObj.val !== "string" || !JSON.parse(requestMessageIdObj.val)) {
      return;
    }
    const chat_id = (0, import_utils.getChatID)(userListWithChatID, user);
    const { json, isValidJson } = (0, import_string.parseJSON)(requestMessageIdObj.val);
    if (!isValidJson || !chat_id) {
      return;
    }
    if (lastMessageId && lastMessageId.val) {
      json[chat_id].push({ id: lastMessageId.val.toString() });
    }
    isDeleting = true;
    const copyMessageIds = (0, import_utils.deepCopy)(json, import_main.adapter);
    json[chat_id].forEach((element, index) => {
      var _a;
      const id = (_a = element.id) == null ? void 0 : _a.toString();
      if (whatShouldDelete === "all" && id) {
        (0, import_botAction.deleteMessageByBot)(instanceTelegram, user, parseInt(id), chat_id);
      }
      if (whatShouldDelete === "last" && index === json[chat_id].length - 1 && id) {
        (0, import_botAction.deleteMessageByBot)(instanceTelegram, user, parseInt(id), chat_id);
      }
      if (!copyMessageIds) {
        return;
      }
      copyMessageIds[chat_id] = removeMessageFromList({ element, chat_id, copyMessageIds });
    });
    await import_main.adapter.setState("communication.requestIds", JSON.stringify(copyMessageIds), true);
  } catch (e) {
    (0, import_logging.errorLogger)("Error deleteMessageIds:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteMessageIds,
  saveMessageIds
});
//# sourceMappingURL=messageIds.js.map
