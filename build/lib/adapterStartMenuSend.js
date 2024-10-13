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
var import_logging = require("./logging");
function adapterStartMenuSend(listOfMenus, startSides, userActiveCheckbox, menusWithUsers, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard) {
  listOfMenus.forEach((menu) => {
    const startSide = [startSides[menu]].toString();
    if (userActiveCheckbox[menu] && startSide != "-" && startSide != "") {
      (0, import_logging.debug)([{ text: "Startseite:", val: startSide }]);
      menusWithUsers[menu].forEach((user) => {
        (0, import_backMenu.backMenuFunc)(startSide, menuData.data[menu][startSide].nav, user);
        (0, import_logging.debug)([{ text: "User List:", val: userListWithChatID }]);
        (0, import_telegram.sendToTelegram)(
          user,
          menuData.data[menu][startSide].text,
          menuData.data[menu][startSide].nav,
          instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID,
          menuData.data[menu][startSide].parse_mode
        );
      });
    } else {
      if (startSide == "-") {
        (0, import_logging.debug)([{ text: `Menu "${menu}" is a Submenu.` }]);
        return;
      }
      (0, import_logging.debug)([{ text: `Menu "${menu}" is inactive.` }]);
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adapterStartMenuSend
});
//# sourceMappingURL=adapterStartMenuSend.js.map
