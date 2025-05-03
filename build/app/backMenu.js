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
var backMenu_exports = {};
__export(backMenu_exports, {
  backMenuFunc: () => backMenuFunc,
  switchBack: () => switchBack
});
module.exports = __toCommonJS(backMenu_exports);
var import_logging = require("./logging");
var import_utilities = require("../lib/utilities");
var import_main = require("../main");
var import_string = require("../lib/string");
var import_config = require("../config/config");
const backMenu = {};
function backMenuFunc({
  activePage,
  navigation,
  userToSend
}) {
  var _a, _b;
  if (!navigation || !(0, import_string.jsonString)(navigation).split(`"`)[1].includes("menu:")) {
    const list = (_a = backMenu[userToSend]) == null ? void 0 : _a.list;
    const lastMenu = (_b = backMenu[userToSend]) == null ? void 0 : _b.last;
    if ((list == null ? void 0 : list.length) === import_config.backMenuLength) {
      list.shift();
    }
    if (!backMenu[userToSend]) {
      backMenu[userToSend] = { list: [], last: "" };
    }
    if (lastMenu && lastMenu !== "" && list) {
      list.push(lastMenu);
    }
    backMenu[userToSend].last = activePage;
  }
}
async function switchBack(userToSend, allMenusWithData, menus, lastMenu = false) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  try {
    const list = ((_a = backMenu[userToSend]) == null ? void 0 : _a.list) ? backMenu[userToSend].list : [];
    const lastListElement = list[list.length - 1];
    const lastElement = (_b = backMenu[userToSend]) == null ? void 0 : _b.last;
    let keyboard;
    let foundedMenu = "";
    if (list.length) {
      for (const menu of menus) {
        const nav = lastElement ? (_d = (_c = allMenusWithData[menu]) == null ? void 0 : _c[lastElement]) == null ? void 0 : _d.nav : void 0;
        const navBefore = (_f = (_e = allMenusWithData[menu]) == null ? void 0 : _e[lastListElement]) == null ? void 0 : _f.nav;
        if (lastMenu && nav) {
          keyboard = nav;
          foundedMenu = menu;
          break;
        } else if (navBefore && !lastMenu) {
          keyboard = navBefore;
          foundedMenu = menu;
          break;
        }
        import_main.adapter.log.debug(`Menu call not found in this Menu: ${menu}`);
      }
      if (keyboard && foundedMenu != "") {
        if (!lastMenu) {
          const listLength = ((_g = backMenu[userToSend]) == null ? void 0 : _g.list) ? backMenu[userToSend].list.length - 1 : 0;
          const lastListElement2 = (_h = backMenu[userToSend]) == null ? void 0 : _h.list[listLength];
          if (!lastListElement2) {
            return;
          }
          const { text, parse_mode: parse_mode2 } = allMenusWithData[foundedMenu][lastListElement2];
          let textToSend2 = text;
          if (textToSend2) {
            textToSend2 = await (0, import_utilities.checkStatusInfo)(textToSend2);
          }
          if ((_i = backMenu[userToSend]) == null ? void 0 : _i.last) {
            backMenu[userToSend].last = (_j = list.pop()) != null ? _j : "";
          }
          return { textToSend: textToSend2, menuToSend: keyboard, parse_mode: parse_mode2 };
        }
        const lastElement2 = (_k = backMenu[userToSend]) == null ? void 0 : _k.last;
        if (!lastElement2) {
          return;
        }
        const { parse_mode, text: textToSend } = allMenusWithData[foundedMenu][lastElement2];
        return { textToSend, menuToSend: keyboard, parse_mode };
      }
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error in switchBack:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  backMenuFunc,
  switchBack
});
//# sourceMappingURL=backMenu.js.map
