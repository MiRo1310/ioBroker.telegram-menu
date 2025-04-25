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
const backMenu = {};
function backMenuFunc({ nav, part, userToSend }) {
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
  import_main.adapter.log.debug(`BackMenu: ${(0, import_string.jsonString)(backMenu)}`);
}
async function switchBack(userToSend, allMenusWithData, menus, lastMenu = false) {
  var _a, _b, _c, _d, _e, _f;
  try {
    const list = backMenu[userToSend] && ((_a = backMenu[userToSend]) == null ? void 0 : _a.list) ? backMenu[userToSend].list : [];
    let keyboard = { inline_keyboard: [] };
    let foundedMenu = "";
    if (list.length != 0) {
      for (const menu of menus) {
        if (lastMenu && ((_c = (_b = allMenusWithData[menu]) == null ? void 0 : _b[backMenu[userToSend].last]) == null ? void 0 : _c.nav)) {
          keyboard = allMenusWithData[menu][backMenu[userToSend].last].nav;
          foundedMenu = menu;
          break;
        } else if (((_d = allMenusWithData[menu][list[list.length - 1]]) == null ? void 0 : _d.nav) && !lastMenu) {
          keyboard = allMenusWithData[menu][list[list.length - 1]].nav;
          import_main.adapter.log.debug("Menu call found");
          foundedMenu = menu;
          break;
        }
        import_main.adapter.log.debug(`Menu call not found in this Menu: ${menu}`);
      }
      if (keyboard && foundedMenu != "") {
        let parse_mode = false;
        if (!lastMenu) {
          let textToSend = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].text;
          if (textToSend) {
            textToSend = await (0, import_utilities.checkStatusInfo)(textToSend);
          }
          parse_mode = (_e = allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]].parse_mode) != null ? _e : false;
          backMenu[userToSend].last = list.pop();
          return { texttosend: textToSend, menuToSend: keyboard, parse_mode };
        }
        parse_mode = (_f = allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode) != null ? _f : false;
        return {
          texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text,
          menuToSend: keyboard,
          parse_mode
        };
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
