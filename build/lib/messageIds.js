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
var messageIds_exports = {};
__export(messageIds_exports, {
  deleteMessageIds: () => deleteMessageIds,
  saveMessageIds: () => saveMessageIds
});
module.exports = __toCommonJS(messageIds_exports);
var import_main = __toESM(require("../main"));
var import_botAction = require("./botAction");
var import_utilities = require("./utilities");
var import_logging = require("./logging");
let isDeleting = false;
async function saveMessageIds(state, instanceTelegram) {
  var _a;
  const _this = import_main.default.getInstance();
  try {
    let requestMessageId = {};
    let requestMessageIdObj = null;
    if (!isDeleting) {
      requestMessageIdObj = await _this.getStateAsync("communication.requestIds");
    }
    isDeleting = false;
    const requestUserIdObj = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
    const request = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.request`);
    if (!(requestUserIdObj && requestUserIdObj.val)) {
      return;
    }
    requestMessageId = requestMessageIdObj && requestMessageIdObj.val ? JSON.parse(requestMessageIdObj.val.toString()) : {};
    if (!requestMessageId[requestUserIdObj.val.toString()]) {
      requestMessageId[requestUserIdObj.val.toString()] = [];
    }
    if (!((_a = requestMessageId[requestUserIdObj.val.toString()]) == null ? void 0 : _a.find((message) => message.id === state.val))) {
      requestMessageId[requestUserIdObj.val.toString()].push({ id: state.val, time: Date.now(), request: request == null ? void 0 : request.val });
    }
    requestMessageId = removeOldMessageIds(requestMessageId, requestUserIdObj.val.toString());
    _this.setState("communication.requestIds", JSON.stringify(requestMessageId), true);
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error saveMessageIds:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
function removeOldMessageIds(messages, chatID) {
  messages[chatID] = messages[chatID].filter((message) => {
    return message.time && message.time > Date.now() - 1e3 * 60 * 60 * 24 * 2;
  });
  return messages;
}
const removeMessageFromList = ({ element, chat_id, copyMessageIds }) => {
  return copyMessageIds[chat_id].filter((message) => message.id !== element.id);
};
async function deleteMessageIds(user, userListWithChatID, instanceTelegram, whatShouldDelete) {
  const _this = import_main.default.getInstance();
  try {
    const requestMessageIdObj = await _this.getStateAsync("communication.requestIds");
    const lastMessageId = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);
    if (!requestMessageIdObj || typeof requestMessageIdObj.val !== "string" || !JSON.parse(requestMessageIdObj.val)) {
      return;
    }
    const chat_id = (0, import_utilities.getChatID)(userListWithChatID, user);
    const messageIds = JSON.parse(requestMessageIdObj.val);
    if (lastMessageId && lastMessageId.val) {
      messageIds[chat_id].push({ id: lastMessageId.val.toString() });
    }
    isDeleting = true;
    const copyMessageIds = JSON.parse(JSON.stringify(messageIds));
    messageIds[chat_id].forEach((element, index) => {
      var _a, _b;
      if (whatShouldDelete === "all" && element.id) {
        (0, import_botAction.deleteMessageByBot)(instanceTelegram, user, userListWithChatID, parseInt((_a = element.id) == null ? void 0 : _a.toString()), chat_id);
      }
      if (whatShouldDelete === "last" && index === messageIds[chat_id].length - 1 && element.id) {
        (0, import_botAction.deleteMessageByBot)(instanceTelegram, user, userListWithChatID, parseInt((_b = element.id) == null ? void 0 : _b.toString()), chat_id);
      }
      copyMessageIds[chat_id] = removeMessageFromList({ element, chat_id, copyMessageIds });
    });
    _this.setState("communication.requestIds", JSON.stringify(copyMessageIds), true);
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error deleteMessageIds:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteMessageIds,
  saveMessageIds
});
//# sourceMappingURL=messageIds.js.map
