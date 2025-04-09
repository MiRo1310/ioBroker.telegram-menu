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
var import_utilities = require("./utilities");
var import_subscribeStates = require("./subscribeStates");
var import_messageIds = require("./messageIds");
var import_dynamicSwitch = require("./dynamicSwitch");
var import_logging = require("./logging");
var import_console = require("console");
var import_global = require("./global");
var import_main = require("../main");
let step = 0;
let returnIDToListenTo = [];
let splittedData = [];
const getMenuValues = (obj) => {
  const splitText = obj[0].split(":");
  return { callbackData: splitText[1], device: splitText[2], val: splitText[3] };
};
const deleteMessages = async (obj) => {
  const navToGoBack = obj.device2Switch;
  if (obj.callbackData.includes("deleteAll")) {
    await (0, import_messageIds.deleteMessageIds)(obj.userToSend, obj.userListWithChatID, obj.instanceTelegram, "all");
  }
  if (navToGoBack && navToGoBack != "") {
    return { navToGoBack };
  }
  return;
};
const setDynamicValue = async (obj) => {
  (0, import_logging.debug)([{ text: "SplittedData:", val: obj.val }]);
  const result = await (0, import_setstate.setState)(
    obj.part,
    obj.userToSend,
    obj.val,
    true,
    obj.instanceTelegram,
    obj.resize_keyboard,
    obj.one_time_keyboard,
    obj.userListWithChatID
  );
  if (Array.isArray(result)) {
    returnIDToListenTo = result;
  }
  return {
    returnIds: returnIDToListenTo
  };
};
const createSubmenuPercent = (obj) => {
  const callbackData = obj.callbackData;
  const device2Switch = obj.device2Switch;
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
const setFirstMenuValue = async (obj) => {
  let val;
  (0, import_logging.debug)([{ text: "SplitData:", val: splittedData }]);
  if (splittedData[1].split(".")[1] == "false") {
    val = false;
  } else if (splittedData[1].split(".")[1] == "true") {
    val = true;
  } else {
    val = splittedData[1].split(".")[1];
  }
  const result = await (0, import_setstate.setState)(
    obj.part,
    obj.userToSend,
    val,
    true,
    obj.instanceTelegram,
    obj.resize_keyboard,
    obj.one_time_keyboard,
    obj.userListWithChatID
  );
  if (Array.isArray(result)) {
    returnIDToListenTo = result;
  }
  return { returnIds: returnIDToListenTo };
};
const setSecondMenuValue = async (obj) => {
  let val;
  if (splittedData[2].split(".")[1] == "false") {
    val = false;
  } else if (splittedData[2].split(".")[1] == "true") {
    val = true;
  } else {
    val = splittedData[2].split(".")[1];
  }
  const result = await (0, import_setstate.setState)(
    obj.part,
    obj.userToSend,
    val,
    true,
    obj.instanceTelegram,
    obj.one_time_keyboard,
    obj.resize_keyboard,
    obj.userListWithChatID
  );
  if (Array.isArray(result)) {
    returnIDToListenTo = result;
  }
  return { returnIds: returnIDToListenTo };
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
  (0, import_logging.debug)([{ text: "keyboard:", val: keyboard }]);
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
const setValueForSubmenuPercent = async (obj) => {
  const value = parseInt(obj.calledValue.split(":")[1].split(",")[1]);
  const result = await (0, import_setstate.setState)(
    obj.part,
    obj.userToSend,
    value,
    true,
    obj.instanceTelegram,
    obj.resize_keyboard,
    obj.one_time_keyboard,
    obj.userListWithChatID
  );
  if (Array.isArray(result)) {
    returnIDToListenTo = result;
  }
  return { returnIds: returnIDToListenTo };
};
const setValueForSubmenuNumber = async (obj) => {
  (0, import_logging.debug)([{ text: "CallbackData:", val: obj.callbackData }]);
  const value = parseFloat(obj.calledValue.split(":")[3]);
  const device2Switch = obj.calledValue.split(":")[2];
  const result = await (0, import_setstate.setState)(
    obj.part,
    obj.userToSend,
    value,
    true,
    obj.instanceTelegram,
    obj.resize_keyboard,
    obj.one_time_keyboard,
    obj.userListWithChatID
  );
  if (Array.isArray(result)) {
    returnIDToListenTo = result;
  }
  return { returnIds: returnIDToListenTo, device2Switch };
};
const back = async (obj) => {
  const result = await (0, import_backMenu.switchBack)(obj.userToSend, obj.allMenusWithData, obj.menus);
  if (result) {
    await (0, import_telegram.sendToTelegram)({
      user: obj.userToSend,
      textToSend: result.texttosend,
      keyboard: result.menuToSend,
      instance: obj.instanceTelegram,
      resize_keyboard: obj.resize_keyboard,
      one_time_keyboard: obj.one_time_keyboard,
      userListWithChatID: obj.userListWithChatID,
      parse_mode: result.parseMode
    });
  }
};
async function callSubMenu(jsonStringNav, newObjectNavStructure, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, allMenusWithData, menus, setStateIdsToListenTo, navObj) {
  try {
    const obj = await subMenu({
      jsonStringNav,
      userToSend,
      instanceTelegram,
      resize_keyboard,
      one_time_keyboard,
      userListWithChatID,
      part,
      allMenusWithData,
      menus,
      navObj
    });
    (0, import_logging.debug)([{ text: "Submenu data:", val: obj == null ? void 0 : obj.text }]);
    (0, import_logging.debug)([{ text: "Submenu data:", val: obj == null ? void 0 : obj.keyboard }]);
    (0, import_logging.debug)([{ text: "Submenu data:", val: obj == null ? void 0 : obj.device }]);
    (0, import_logging.debug)([{ text: "Submenu data:", val: obj == null ? void 0 : obj.navToGoBack }]);
    if (obj == null ? void 0 : obj.returnIds) {
      setStateIdsToListenTo = obj.returnIds;
      await (0, import_subscribeStates._subscribeAndUnSubscribeForeignStatesAsync)({ array: obj.returnIds });
    }
    if ((obj == null ? void 0 : obj.text) && (obj == null ? void 0 : obj.keyboard)) {
      (0, import_telegram.sendToTelegramSubmenu)(
        userToSend,
        obj.text,
        obj.keyboard,
        instanceTelegram,
        userListWithChatID,
        part.parse_mode || "false"
      );
    }
    return { setStateIdsToListenTo, newNav: obj == null ? void 0 : obj.navToGoBack };
  } catch (e) {
    (0, import_console.error)({
      array: [
        { text: "Error callSubMenu:", val: e.message },
        { text: "Stack:", val: e.stack }
      ]
    });
  }
}
async function subMenu({
  jsonStringNav,
  userToSend,
  instanceTelegram,
  resize_keyboard,
  one_time_keyboard,
  userListWithChatID,
  part,
  allMenusWithData,
  menus,
  navObj
}) {
  try {
    import_main._this.log.debug(`Menu : ${navObj[0][0]}`);
    let text = "";
    if ((part == null ? void 0 : part.text) && part.text != "") {
      text = await (0, import_utilities.checkStatusInfo)(part.text);
    }
    const called = (0, import_global.parseJSON)(jsonStringNav);
    if (!(called == null ? void 0 : called.length)) {
      return;
    }
    const { callbackData, device: device2Switch, val } = getMenuValues(called[0]);
    if (callbackData.includes("delete")) {
      return await deleteMessages({
        userToSend,
        userListWithChatID,
        instanceTelegram,
        device2Switch,
        callbackData
      });
    } else if (callbackData.includes("switch")) {
      return createSwitchMenu({ callbackData, text, device2Switch });
    } else if (callbackData.includes("first")) {
      return await setFirstMenuValue({
        part,
        userToSend,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID
      });
    } else if (callbackData.includes("second")) {
      return await setSecondMenuValue({
        part,
        userToSend,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID
      });
    } else if (callbackData.includes("dynSwitch")) {
      return (0, import_dynamicSwitch.dynamicSwitch)(jsonStringNav, device2Switch, text);
    } else if (callbackData.includes("dynS")) {
      return await setDynamicValue({
        val,
        userToSend,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        part
      });
    } else if (!jsonStringNav.includes("submenu") && callbackData.includes("percent")) {
      return createSubmenuPercent({ callbackData, text, device2Switch });
    } else if (jsonStringNav.includes(`submenu:percent${step}`)) {
      return await setValueForSubmenuPercent({
        callbackData,
        calledValue: jsonStringNav,
        userToSend,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        part,
        allMenusWithData,
        menus
      });
    } else if (!jsonStringNav.includes("submenu") && callbackData.includes("number")) {
      return createSubmenuNumber({ callbackData, text, device2Switch });
    } else if (jsonStringNav.includes(`submenu:${callbackData}`)) {
      const result = await setValueForSubmenuNumber({
        callbackData,
        calledValue: jsonStringNav,
        userToSend,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        part
      });
      return result.returnIds ? { returnIds: result.returnIds } : void 0;
    } else if (callbackData === "back") {
      await back({
        userToSend,
        allMenusWithData,
        menus,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID
      });
    }
    return;
  } catch (error2) {
    error2([
      { text: "Error subMenu:", val: error2.message },
      { text: "Stack", val: error2.stack }
    ]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  callSubMenu,
  subMenu
});
//# sourceMappingURL=subMenu.js.map
