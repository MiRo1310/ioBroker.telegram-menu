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
var adapterStartMenuSend_exports = {};
__export(adapterStartMenuSend_exports, {
  adapterStartMenuSend: () => adapterStartMenuSend
});
module.exports = __toCommonJS(adapterStartMenuSend_exports);
var import_appUtils = require("@b/lib/appUtils");
var import_backMenu = require("@b/app/backMenu");
var import_string = require("@b/lib/string");
var import_telegram = require("@b/app/telegram");
function isUserActive(telegramParams, userToSend) {
  return telegramParams.userListWithChatID.find(
    (user) => user.chatID === userToSend.chatId && user.instance === userToSend.instance
  );
}
async function adapterStartMenuSend(listOfMenus, startSides, userActiveCheckbox, menusWithUsers, menuData, telegramParams) {
  const adapter = telegramParams.adapter;
  for (const menu of listOfMenus) {
    const startSide = startSides[menu];
    if (userActiveCheckbox[menu] && (0, import_appUtils.isStartside)(startSide)) {
      adapter.log.debug(`Startside: ${startSide}`);
      const group = menusWithUsers[menu];
      if (group) {
        for (const userToSend of group) {
          const { nav, text, parse_mode } = menuData[menu][startSide];
          const user = isUserActive(telegramParams, userToSend);
          if (!user) {
            continue;
          }
          (0, import_backMenu.backMenuFunc)({ activePage: startSide, navigation: nav, userToSend: userToSend.name });
          adapter.log.debug(`User list: ${(0, import_string.jsonString)(telegramParams.userListWithChatID)}`);
          const params = { ...telegramParams };
          await (0, import_telegram.sendToTelegram)({
            instance: userToSend.instance,
            userToSend: userToSend.name,
            textToSend: text,
            keyboard: nav,
            telegramParams: params,
            parse_mode
          });
        }
      }
    } else {
      if (!(0, import_appUtils.isStartside)(startSide)) {
        adapter.log.debug(`Menu "${menu}" is a Submenu.`);
        continue;
      }
      adapter.log.debug(`Menu "${menu}" is inactive.`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adapterStartMenuSend
});
//# sourceMappingURL=adapterStartMenuSend.js.map
