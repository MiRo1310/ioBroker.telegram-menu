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
var import_telegram = require("./telegram");
var import_backMenu = require("./backMenu");
var import_main = require("../main");
var import_string = require("../lib/string");
var import_appUtils = require("../lib/appUtils");
async function adapterStartMenuSend(listOfMenus, startSides, userActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard) {
  var _a, _b;
  for (const menu of listOfMenus) {
    const startSide = [startSides[menu]].toString();
    if (userActiveCheckbox[menu] && (0, import_appUtils.isStartside)(startSide)) {
      import_main.adapter.log.debug(`Startside: ${startSide}`);
      for (const userToSend of menusWithUsers[menu]) {
        (0, import_backMenu.backMenuFunc)({ nav: startSide, part: menuData[menu][startSide].nav, userToSend });
        import_main.adapter.log.debug(`User list: ${(0, import_string.jsonString)(userListWithChatID)}`);
        await (0, import_telegram.sendToTelegram)({
          userToSend,
          textToSend: (_a = menuData[menu][startSide].text) != null ? _a : "",
          keyboard: menuData[menu][startSide].nav,
          telegramInstance: instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID,
          parse_mode: (_b = menuData[menu][startSide].parse_mode) != null ? _b : false
        });
      }
    } else {
      if (startSide == "-") {
        import_main.adapter.log.debug(`Menu "${menu}" is a Submenu.`);
        continue;
      }
      import_main.adapter.log.debug(`Menu "${menu}" is inactive.`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adapterStartMenuSend
});
//# sourceMappingURL=adapterStartMenuSend.js.map
