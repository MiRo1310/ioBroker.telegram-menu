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
const getConfigVariables = (config, adapter) => {
  var _a, _b, _c;
  const c = config;
  const telegramInstances = (_a = c.instanceList) != null ? _a : [];
  const checkboxes = c.checkbox;
  const telegramParams = {
    telegramInstanceList: telegramInstances,
    resize_keyboard: checkboxes.resKey,
    one_time_keyboard: checkboxes.oneTiKey,
    userListWithChatID: c.userListWithChatID,
    adapter
  };
  return {
    checkboxes,
    checkboxNoEntryFound: checkboxes.checkboxNoValueFound,
    sendMenuAfterRestart: checkboxes.sendMenuAfterRestart,
    listOfMenus: c.usersInGroup ? Object.keys(c.usersInGroup) : [],
    token: c.tokenGrafana,
    directoryPicture: (_b = c.directory) != null ? _b : "/opt/iobroker/media/",
    isUserActiveCheckbox: c.userActiveCheckbox,
    menusWithUsers: c.usersInGroup,
    textNoEntryFound: (_c = c.textNoEntry) != null ? _c : "Entry not found",
    dataObject: c.data,
    telegramParams
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getConfigVariables,
  getIds
});
//# sourceMappingURL=configVariables.js.map
