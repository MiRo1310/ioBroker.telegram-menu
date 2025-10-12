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
var subMenu_exports = {};
__export(subMenu_exports, {
  callSubMenu: () => callSubMenu,
  subMenu: () => subMenu
});
module.exports = __toCommonJS(subMenu_exports);
var import_backMenu = require("./backMenu");
var import_setstate = require("./setstate");
var import_telegram = require("./telegram");
var import_utilities = require("../lib/utilities");
var import_messageIds = require("./messageIds");
var import_dynamicSwitchMenu = require("./dynamicSwitchMenu");
var import_string = require("../lib/string");
var import_logging = require("./logging");
var import_splitValues = require("../lib/splitValues");
var import_validateMenus = require("./validateMenus");
let step = 0;
let splittedData = [];
const createSubmenuPercent = (obj) => {
  const { cbData, menuToHandle } = obj;
  step = parseFloat(cbData.replace("percent", ""));
  let rowEntries = 0;
  let menu = [];
  const keyboard = {
    inline_keyboard: []
  };
  for (let i = 100; i >= 0; i -= step) {
    menu.push({
      text: `${i}%`,
      callback_data: `submenu:percent${step},${i}:${menuToHandle}`
    });
    if (i != 0 && i - step < 0) {
      menu.push({
        text: `0%`,
        callback_data: `submenu:percent${step},${0}:${menuToHandle}`
      });
    }
    rowEntries++;
    if (rowEntries == 8) {
      keyboard.inline_keyboard.push(menu);
      menu = [];
      rowEntries = 0;
    }
  }
  if (rowEntries != 0) {
    keyboard.inline_keyboard.push(menu);
  }
  return { text: obj.text, keyboard, device: menuToHandle };
};
const setMenuValue = async ({
  instance,
  telegramParams,
  userToSend,
  part,
  menuNumber
}) => {
  var _a;
  if (!splittedData[menuNumber]) {
    return;
  }
  let val = (_a = splittedData[menuNumber].split(".")) == null ? void 0 : _a[1];
  if (val === void 0) {
    return;
  }
  if (val === "false") {
    val = false;
  } else if (val === "true") {
    val = true;
  }
  await (0, import_setstate.handleSetState)(instance, part, userToSend, val, telegramParams);
};
const createSubmenuNumber = ({
  cbData,
  menuToHandle,
  text,
  adapter
}) => {
  if (cbData.includes("(-)")) {
    cbData = cbData.replace("(-)", "negativ");
  }
  const splittedData2 = cbData.replace("number", "").split("-");
  let rowEntries = 0;
  let menu = [];
  const keyboard = {
    inline_keyboard: []
  };
  let unit = "";
  if (splittedData2[3] != "") {
    unit = splittedData2[3];
  }
  let start, end;
  const firstValueInText = parseFloat(
    splittedData2[0].includes("negativ") ? splittedData2[0].replace("negativ", "-") : splittedData2[0]
  );
  const secondValueInText = parseFloat(
    splittedData2[1].includes("negativ") ? splittedData2[1].replace("negativ", "-") : splittedData2[1]
  );
  if (firstValueInText < secondValueInText) {
    start = secondValueInText;
    end = firstValueInText;
  } else {
    start = firstValueInText;
    end = secondValueInText;
  }
  let index = -1;
  let maxEntriesPerRow = 8;
  const step2 = parseFloat(
    splittedData2[2].includes("negativ") ? splittedData2[2].replace("negativ", "-") : splittedData2[2]
  );
  if (step2 < 1) {
    maxEntriesPerRow = 6;
  }
  for (let i = start; i >= end; i -= step2) {
    if (parseFloat(splittedData2[0]) < parseFloat(splittedData2[1])) {
      if (i === start) {
        index = end - step2;
      }
      index = index + step2;
    } else {
      index = i;
    }
    menu.push({
      text: `${index}${unit}`,
      callback_data: `submenu:${cbData}:${menuToHandle}:${index}`
    });
    rowEntries++;
    if (rowEntries == maxEntriesPerRow) {
      keyboard.inline_keyboard.push(menu);
      menu = [];
      rowEntries = 0;
    }
  }
  if (rowEntries != 0) {
    keyboard.inline_keyboard.push(menu);
  }
  adapter.log.debug(`Keyboard : ${(0, import_string.jsonString)(keyboard)}`);
  return { text, keyboard, menuToHandle };
};
const createSwitchMenu = ({
  menuToHandle,
  cbData,
  text
}) => {
  splittedData = cbData.split("-");
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: splittedData[1].split(".")[0],
          callback_data: `menu:first:${menuToHandle}`
        },
        {
          text: splittedData[2].split(".")[0],
          callback_data: `menu:second:${menuToHandle}`
        }
      ]
    ]
  };
  return { text, keyboard, device: menuToHandle };
};
const back = async ({ instance, telegramParams, userToSend, allMenusWithData, menus }) => {
  const result = await (0, import_backMenu.switchBack)(telegramParams.adapter, userToSend, allMenusWithData, menus);
  if (result) {
    const { keyboard, parse_mode, textToSend = "" } = result;
    await (0, import_telegram.sendToTelegram)({ instance, userToSend, textToSend, keyboard, parse_mode, telegramParams });
  }
};
async function callSubMenu({
  instance,
  jsonStringNav,
  userToSend,
  telegramParams,
  part,
  allMenusWithData,
  menus,
  adapter
}) {
  try {
    const obj = await subMenu({
      instance,
      menuString: jsonStringNav,
      userToSend,
      telegramParams,
      part,
      allMenusWithData,
      menus,
      adapter
    });
    adapter.log.debug(`Submenu : ${(0, import_string.jsonString)(obj)}`);
    if ((obj == null ? void 0 : obj.text) && (obj == null ? void 0 : obj.keyboard)) {
      (0, import_telegram.sendToTelegramSubmenu)(instance, userToSend, obj.text, obj.keyboard, telegramParams, part.parse_mode);
    }
    return { newNav: obj == null ? void 0 : obj.navToGoBack };
  } catch (e) {
    (0, import_logging.errorLogger)("Error callSubMenu:", e, adapter);
  }
}
async function subMenu({
  menuString,
  userToSend,
  telegramParams,
  part,
  allMenusWithData,
  menus,
  instance,
  adapter
}) {
  var _a, _b, _c;
  try {
    adapter.log.debug(`Menu : ${menuString}`);
    const text = await (0, import_utilities.textModifier)(adapter, part.text);
    if ((0, import_validateMenus.isDeleteMenu)(menuString)) {
      await (0, import_messageIds.deleteMessageIds)(instance, userToSend, telegramParams, "all");
      const menu = (_c = (_b = (_a = menuString.split(":")) == null ? void 0 : _a[2]) == null ? void 0 : _b.split('"')) == null ? void 0 : _c[0];
      if (menu && (0, import_string.isNonEmptyString)(menu)) {
        return { navToGoBack: menu };
      }
    }
    const { cbData, menuToHandle, val } = (0, import_splitValues.getMenuValues)(menuString);
    if ((0, import_validateMenus.isCreateSwitch)(cbData) && menuToHandle) {
      return createSwitchMenu({ adapter, cbData, text, menuToHandle });
    }
    if ((0, import_validateMenus.isFirstMenuValue)(cbData)) {
      await setMenuValue({
        instance,
        part,
        userToSend,
        telegramParams,
        menuNumber: 1
      });
    }
    if ((0, import_validateMenus.isSecondMenuValue)(cbData)) {
      await setMenuValue({ instance, part, userToSend, telegramParams, menuNumber: 2 });
    }
    if ((0, import_validateMenus.isCreateDynamicSwitch)(cbData) && menuToHandle) {
      return (0, import_dynamicSwitchMenu.createDynamicSwitchMenu)(adapter, menuString, menuToHandle, text);
    }
    if ((0, import_validateMenus.isSetDynamicSwitchVal)(cbData) && val) {
      await (0, import_setstate.handleSetState)(instance, part, userToSend, val, telegramParams);
    }
    if ((0, import_validateMenus.isCreateSubmenuPercent)(menuString, cbData) && menuToHandle) {
      return createSubmenuPercent({ adapter, cbData, text, menuToHandle });
    }
    if ((0, import_validateMenus.isSetSubmenuPercent)(menuString, step)) {
      const value = parseInt(menuString.split(":")[1].split(",")[1]);
      await (0, import_setstate.handleSetState)(instance, part, userToSend, value, telegramParams);
    }
    if ((0, import_validateMenus.isCreateSubmenuNumber)(menuString, cbData) && menuToHandle) {
      return createSubmenuNumber({ adapter, cbData, text, menuToHandle });
    }
    if ((0, import_validateMenus.isSetSubmenuNumber)(menuString)) {
      const { value } = (0, import_splitValues.getSubmenuNumberValues)(menuString);
      await (0, import_setstate.handleSetState)(instance, part, userToSend, value, telegramParams);
    }
    if ((0, import_validateMenus.isMenuBack)(menuString)) {
      await back({
        instance,
        userToSend,
        allMenusWithData,
        menus,
        telegramParams
      });
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error subMenu:", error, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  callSubMenu,
  subMenu
});
//# sourceMappingURL=subMenu.js.map
