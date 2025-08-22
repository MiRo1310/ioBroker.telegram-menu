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
var configVariables_exports = {};
__export(configVariables_exports, {
  getConfigVariables: () => getConfigVariables,
  getIds: () => getIds
});
module.exports = __toCommonJS(configVariables_exports);
const getIds = {
  telegramRequestID: (instance) => `${instance}.communicate.request`,
  telegramBotSendMessageID: (instance) => `${instance}.communicate.botSendMessageId`,
  telegramRequestMessageID: (instance) => `${instance}.communicate.requestMessageId`,
  telegramInfoConnectionID: (instance) => `${instance}.info.connection`,
  telegramRequestChatID: (instance) => `${instance}.communicate.requestChatId`
};
const getConfigVariables = (config) => {
  var _a, _b;
  const telegramInstances = (_a = config.instanceList) != null ? _a : [];
  const checkboxes = config.checkbox;
  const telegramParams = {
    telegramInstanceList: telegramInstances,
    resize_keyboard: checkboxes.resKey,
    one_time_keyboard: checkboxes.oneTiKey,
    userListWithChatID: config.userListWithChatID
  };
  return {
    checkboxes,
    checkboxNoEntryFound: checkboxes.checkboxNoValueFound,
    sendMenuAfterRestart: checkboxes.sendMenuAfterRestart,
    listOfMenus: config.usersInGroup ? Object.keys(config.usersInGroup) : [],
    token: config.tokenGrafana,
    directoryPicture: config.directory,
    isUserActiveCheckbox: config.userActiveCheckbox,
    menusWithUsers: config.usersInGroup,
    textNoEntryFound: (_b = config.textNoEntry) != null ? _b : "Entry not found",
    dataObject: config.data,
    telegramParams
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getConfigVariables,
  getIds
});
//# sourceMappingURL=configVariables.js.map
