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
var import_utilities = require("./utilities");
const backMenu = {};
function backMenuFunc(nav, part, userToSend) {
  if (!part || !JSON.stringify(part).split(`"`)[1].includes("menu:")) {
    if (backMenu[userToSend] && backMenu[userToSend].list.length === 20) {
      backMenu[userToSend].list.shift();
    } else if (!backMenu[userToSend]) {
      backMenu[userToSend] = { list: [], last: "" };
    }
    if (backMenu[userToSend].last !== "") {
      backMenu[userToSend].list.push(backMenu[userToSend].last);
    }
    backMenu[userToSend].last = nav;
  }
  (0, import_logging.debug)([{ text: "GoBackMenu", val: backMenu }]);
}
async function switchBack(userToSend, allMenusWithData, menus, lastMenu = false) {
  var _a, _b, _c, _d;
  try {
    const list = backMenu[userToSend] && ((_a = backMenu[userToSend]) == null ? void 0 : _a.list) ? backMenu[userToSend].list : [];
    let menuToSend = [];
    let foundedMenu = "";
    if (list.length != 0) {
      for (const menu of menus) {
        if (lastMenu && ((_c = (_b = allMenusWithData[menu]) == null ? void 0 : _b[backMenu[userToSend].last]) == null ? void 0 : _c.nav)) {
          menuToSend = allMenusWithData[menu][backMenu[userToSend].last].nav;
          foundedMenu = menu;
          break;
        } else if (((_d = allMenusWithData[menu][list[list.length - 1]]) == null ? void 0 : _d.nav) && !lastMenu) {
          menuToSend = allMenusWithData[menu][list[list.length - 1]].nav;
          (0, import_logging.debug)([{ text: "Menu call found" }]);
          foundedMenu = menu;
          break;
        }
        (0, import_logging.debug)([{ text: "Menu call not found in this Menu" }]);
      }
      if (menuToSend && foundedMenu != "") {
        let parseMode = "";
        if (!lastMenu) {
          let textToSend = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].text;
          if (textToSend) {
            textToSend = await (0, import_utilities.checkStatusInfo)(textToSend);
          }
          parseMode = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].parse_mode || "false";
          backMenu[userToSend].last = list.pop();
          return { texttosend: textToSend, menuToSend, parseMode };
        } else {
          parseMode = allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode || "false";
          return {
            texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text,
            menuToSend,
            parseMode
          };
        }
      }
    }
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error in switchBack:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  backMenuFunc,
  switchBack
});
//# sourceMappingURL=backMenu.js.map
