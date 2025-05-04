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
var import_main = require("../main");
var import_logging = require("./logging");
var import_splitValues = require("../lib/splitValues");
let step = 0;
let splittedData = [];
const isMenuBack = (str) => str.includes("menu:back");
const createSubmenuPercent = (obj) => {
  const { callbackData, device2Switch } = obj;
  step = parseFloat(callbackData.replace("percent", ""));
  let rowEntries = 0;
  let menu = [];
  const keyboard = {
    inline_keyboard: []
  };
  for (let i = 100; i >= 0; i -= step) {
    menu.push({
      text: `${i}%`,
      callback_data: `submenu:percent${step},${i}:${device2Switch}`
    });
    if (i != 0 && i - step < 0) {
      menu.push({
        text: `0%`,
        callback_data: `submenu:percent${step},${0}:${device2Switch}`
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
  return { text: obj.text, keyboard, device: device2Switch };
};
const setFirstMenuValue = async ({ telegramParams, userToSend, part }) => {
  let val;
  import_main.adapter.log.debug(`SplitData: ${(0, import_string.jsonString)(splittedData)}`);
  if (splittedData[1].split(".")[1] == "false") {
    val = false;
  } else if (splittedData[1].split(".")[1] == "true") {
    val = true;
  } else {
    val = splittedData[1].split(".")[1];
  }
  await (0, import_setstate.handleSetState)(part, userToSend, val, true, telegramParams);
};
const setSecondMenuValue = async ({ telegramParams, part, userToSend }) => {
  let val;
  if (splittedData[2].split(".")[1] == "false") {
    val = false;
  } else if (splittedData[2].split(".")[1] == "true") {
    val = true;
  } else {
    val = splittedData[2].split(".")[1];
  }
  await (0, import_setstate.handleSetState)(part, userToSend, val, true, telegramParams);
};
const createSubmenuNumber = (obj) => {
  let callbackData = obj.callbackData;
  const device2Switch = obj.device2Switch;
  if (callbackData.includes("(-)")) {
    callbackData = callbackData.replace("(-)", "negativ");
  }
  const splittedData2 = callbackData.replace("number", "").split("-");
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
      callback_data: `submenu:${callbackData}:${device2Switch}:${index}`
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
  import_main.adapter.log.debug(`Keyboard: ${(0, import_string.jsonString)(keyboard)}`);
  return { text: obj.text, keyboard, device: device2Switch };
};
const createSwitchMenu = ({
  device2Switch,
  callbackData,
  text
}) => {
  splittedData = callbackData.split("-");
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: splittedData[1].split(".")[0],
          callback_data: `menu:first:${device2Switch}`
        },
        {
          text: splittedData[2].split(".")[0],
          callback_data: `menu:second:${device2Switch}`
        }
      ]
    ]
  };
  return { text, keyboard, device: device2Switch };
};
const getSubmenuNumberVales = (str) => {
  const splitText = str.split(":");
  return { callbackData: splitText[1], device: splitText[2], value: parseFloat(splitText[3]) };
};
const setValueForSubmenuPercent = async ({
  part,
  userToSend,
  telegramParams,
  calledValue
}) => {
  const value = parseInt(calledValue.split(":")[1].split(",")[1]);
  await (0, import_setstate.handleSetState)(part, userToSend, value, true, telegramParams);
};
const setValueForSubmenuNumber = async ({
  callbackData,
  calledValue,
  userToSend,
  telegramParams,
  part
}) => {
  import_main.adapter.log.debug(`CallbackData: ${callbackData}`);
  const { value } = getSubmenuNumberVales(calledValue);
  await (0, import_setstate.handleSetState)(part, userToSend, value, true, telegramParams);
};
const back = async ({ telegramParams, userToSend, allMenusWithData, menus }) => {
  const result = await (0, import_backMenu.switchBack)(userToSend, allMenusWithData, menus);
  if (result) {
    const { menuToSend, parse_mode, textToSend = "" } = result;
    await (0, import_telegram.sendToTelegram)({
      userToSend,
      textToSend,
      keyboard: menuToSend,
      parse_mode,
      telegramParams
    });
  }
};
async function callSubMenu({
  jsonStringNav,
  userToSend,
  telegramParams,
  part,
  allMenusWithData,
  menus,
  navObj
}) {
  try {
    const obj = await subMenu({
      jsonStringNav,
      userToSend,
      telegramParams,
      part,
      allMenusWithData,
      menus,
      navObj
    });
    import_main.adapter.log.debug(`Submenu: ${(0, import_string.jsonString)(obj)}`);
    if ((obj == null ? void 0 : obj.text) && (obj == null ? void 0 : obj.keyboard)) {
      (0, import_telegram.sendToTelegramSubmenu)(userToSend, obj.text, obj.keyboard, telegramParams, part.parse_mode);
    }
    return { newNav: obj == null ? void 0 : obj.navToGoBack };
  } catch (e) {
    (0, import_logging.errorLogger)("Error callSubMenu:", e, import_main.adapter);
  }
}
function isCreateSubmenuNumber(jsonStringNav, callbackData) {
  return !jsonStringNav.includes("submenu") && callbackData.includes("number");
}
async function subMenu({
  jsonStringNav,
  userToSend,
  telegramParams,
  part,
  allMenusWithData,
  menus,
  navObj
}) {
  try {
    const firstNavigationElement = navObj == null ? void 0 : navObj[0][0];
    if (!firstNavigationElement) {
      return;
    }
    import_main.adapter.log.debug(`Menu : ${firstNavigationElement}`);
    const text = await (0, import_utilities.checkStatusInfo)(part.text);
    const { callbackData, menuToHandle, val } = (0, import_splitValues.getMenuValues)(firstNavigationElement);
    if (callbackData.includes("delete") && menuToHandle) {
      await (0, import_messageIds.deleteMessageIds)(userToSend, telegramParams, "all");
      if ((0, import_string.isNonEmptyString)(menuToHandle)) {
        return { navToGoBack: menuToHandle };
      }
    }
    if (callbackData.includes("switch") && menuToHandle) {
      return createSwitchMenu({ callbackData, text, device2Switch: menuToHandle });
    }
    if (callbackData.includes("first")) {
      await setFirstMenuValue({
        part,
        userToSend,
        telegramParams
      });
    }
    if (callbackData.includes("second")) {
      await setSecondMenuValue({
        part,
        userToSend,
        telegramParams
      });
    }
    if (callbackData.includes("dynSwitch") && menuToHandle) {
      return (0, import_dynamicSwitchMenu.dynamicSwitchMenu)(jsonStringNav, menuToHandle, text);
    }
    if (callbackData.includes("dynS") && val) {
      await (0, import_setstate.handleSetState)(part, userToSend, val, true, telegramParams);
    }
    if (!jsonStringNav.includes("submenu") && callbackData.includes("percent") && menuToHandle) {
      return createSubmenuPercent({ callbackData, text, device2Switch: menuToHandle });
    }
    if (jsonStringNav.includes(`submenu:percent${step}`)) {
      await setValueForSubmenuPercent({
        callbackData,
        calledValue: jsonStringNav,
        userToSend,
        telegramParams,
        part,
        allMenusWithData,
        menus
      });
    }
    if (isCreateSubmenuNumber(jsonStringNav, callbackData) && menuToHandle) {
      return createSubmenuNumber({ callbackData, text, device2Switch: menuToHandle });
    }
    if (jsonStringNav.includes(`submenu:${callbackData}`)) {
      await setValueForSubmenuNumber({
        callbackData,
        calledValue: jsonStringNav,
        userToSend,
        telegramParams,
        part
      });
    }
    if (isMenuBack(firstNavigationElement)) {
      await back({
        userToSend,
        allMenusWithData,
        menus,
        telegramParams
      });
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error subMenu:", error, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  callSubMenu,
  subMenu
});
//# sourceMappingURL=subMenu.js.map
