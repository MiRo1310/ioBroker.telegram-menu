"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var processData_exports = {};
__export(processData_exports, {
  checkEveryMenuForData: () => checkEveryMenuForData,
  getStateIdsToListenTo: () => getStateIdsToListenTo,
  getTimeouts: () => getTimeouts
});
module.exports = __toCommonJS(processData_exports);
var import_main = __toESM(require("../main"));
var import_telegram = require("./telegram");
var import_sendNav = require("./sendNav");
var import_subMenu = require("./subMenu");
var import_backMenu = require("./backMenu");
var import_setstate = require("./setstate");
var import_getstate = require("./getstate");
var import_sendpic = require("./sendpic");
var import_dynamicValue = require("./dynamicValue");
var import_action = require("./action");
var import_subscribeStates = require("./subscribeStates");
var import_echarts = require("./echarts");
var import_httpRequest = require("./httpRequest");
var import_logging = require("./logging");
let setStateIdsToListenTo = [];
let timeouts = [];
async function checkEveryMenuForData(obj) {
  const {
    menuData,
    calledValue,
    userToSend,
    instanceTelegram,
    resize_keyboard,
    one_time_keyboard,
    userListWithChatID,
    menus,
    isUserActiveCheckbox,
    token,
    directoryPicture,
    timeoutKey
  } = obj;
  const _this = import_main.default.getInstance();
  for (const menu of menus) {
    const groupData = menuData.data[menu];
    (0, import_logging.debug)([
      { text: "Nav:", val: menuData.data[menu] },
      { text: "Menu:", val: menu },
      { text: "Group:", val: menuData.data[menu] }
    ]);
    if (await processData({
      _this,
      menuData,
      calledValue,
      userToSend,
      groupWithUser: menu,
      instanceTelegram,
      resize_keyboard,
      one_time_keyboard,
      userListWithChatID,
      allMenusWithData: menuData.data,
      menus,
      isUserActiveCheckbox,
      token,
      directoryPicture,
      timeoutKey,
      groupData
    })) {
      (0, import_logging.debug)([{ text: "CalledText found" }]);
      (0, import_logging.debug)([{ text: "CalledText found" }]);
      return true;
    }
  }
  return false;
}
async function processData(obj) {
  const {
    _this,
    menuData,
    calledValue,
    userToSend,
    groupWithUser,
    instanceTelegram,
    resize_keyboard,
    one_time_keyboard,
    userListWithChatID,
    allMenusWithData,
    menus,
    isUserActiveCheckbox,
    token,
    directoryPicture,
    timeoutKey,
    groupData
  } = obj;
  try {
    let part = {};
    let call = "";
    if ((0, import_dynamicValue.getDynamicValue)(userToSend)) {
      const res = (0, import_dynamicValue.getDynamicValue)(userToSend);
      let valueToSet;
      if (res && res.valueType) {
        valueToSet = (0, import_action.adjustValueType)(calledValue, res.valueType);
      } else {
        valueToSet = calledValue;
      }
      if (valueToSet) {
        await _this.setForeignStateAsync(res == null ? void 0 : res.id, valueToSet, res == null ? void 0 : res.ack);
      } else {
        await (0, import_telegram.sendToTelegram)(
          userToSend,
          `You insert a wrong Type of value, please insert type: ${res == null ? void 0 : res.valueType}`,
          void 0,
          instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID,
          "false"
        );
      }
      (0, import_dynamicValue.removeUserFromDynamicValue)(userToSend);
      const result = await (0, import_backMenu.switchBack)(userToSend, allMenusWithData, menus, true);
      if (result) {
        await (0, import_telegram.sendToTelegram)(
          userToSend,
          result.texttosend || "",
          result.menuToSend,
          instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID,
          result.parseMode
        );
      } else {
        await (0, import_sendNav.sendNav)(
          part,
          userToSend,
          instanceTelegram,
          userListWithChatID,
          resize_keyboard,
          one_time_keyboard
        );
      }
      return true;
    }
    if (calledValue.includes("menu:")) {
      call = calledValue.split(":")[2];
    } else {
      call = calledValue;
    }
    part = groupData[call];
    if (typeof call === "string" && groupData && part && !calledValue.toString().includes("menu:") && userToSend && groupWithUser && isUserActiveCheckbox[groupWithUser]) {
      if (part.nav) {
        (0, import_logging.debug)([{ text: "Menu to Send:", val: part.nav }]);
        (0, import_backMenu.backMenuFunc)(call, part.nav, userToSend);
        if (JSON.stringify(part.nav).includes("menu:")) {
          (0, import_logging.debug)([{ text: "Submenu" }]);
          const result = await (0, import_subMenu.callSubMenu)(
            JSON.stringify(part.nav),
            groupData,
            userToSend,
            instanceTelegram,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID,
            part,
            allMenusWithData,
            menus,
            setStateIdsToListenTo
          );
          if (result && result.setStateIdsToListenTo) {
            setStateIdsToListenTo = result.setStateIdsToListenTo;
          }
          if (result && result.newNav) {
            await checkEveryMenuForData({
              menuData,
              calledValue: result.newNav,
              userToSend,
              instanceTelegram,
              resize_keyboard,
              one_time_keyboard,
              userListWithChatID,
              menus,
              isUserActiveCheckbox,
              token,
              directoryPicture,
              timeoutKey
            });
          }
        } else {
          await (0, import_sendNav.sendNav)(
            part,
            userToSend,
            instanceTelegram,
            userListWithChatID,
            resize_keyboard,
            one_time_keyboard
          );
        }
        return true;
      }
      if (part.switch) {
        const result = await (0, import_setstate.setState)(
          part,
          userToSend,
          0,
          false,
          instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID
        );
        if (result) {
          setStateIdsToListenTo = result;
        }
        if (Array.isArray(setStateIdsToListenTo)) {
          await (0, import_subscribeStates._subscribeAndUnSubscribeForeignStatesAsync)({ array: setStateIdsToListenTo });
        }
        return true;
      }
      if (part.getData) {
        (0, import_getstate.getState)(part, userToSend, instanceTelegram, one_time_keyboard, resize_keyboard, userListWithChatID);
        return true;
      }
      if (part.sendPic) {
        const result = (0, import_sendpic.sendPic)(
          part,
          userToSend,
          instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID,
          token,
          directoryPicture,
          timeouts,
          timeoutKey
        );
        if (result) {
          timeouts = result;
        } else {
          (0, import_logging.debug)([{ text: "Timeouts not found" }]);
        }
        return true;
      }
      if (part.location) {
        (0, import_logging.debug)([{ text: "Send Location" }]);
        await (0, import_telegram.sendLocationToTelegram)(userToSend, part.location, instanceTelegram, userListWithChatID);
        return true;
      }
      if (part.echarts) {
        (0, import_logging.debug)([{ text: "Echarts" }]);
        (0, import_echarts.getChart)(
          part.echarts,
          directoryPicture,
          userToSend,
          instanceTelegram,
          userListWithChatID,
          resize_keyboard,
          one_time_keyboard
        );
        return true;
      }
      if (part.httpRequest) {
        (0, import_logging.debug)([{ text: "HttpRequest" }]);
        const result = await (0, import_httpRequest.httpRequest)(
          part,
          userToSend,
          instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID,
          directoryPicture
        );
        if (result) {
          return true;
        }
      }
    }
    if ((calledValue.startsWith("menu") || calledValue.startsWith("submenu")) && menuData.data[groupWithUser][call]) {
      (0, import_logging.debug)([{ text: "Call Submenu" }]);
      const result = await (0, import_subMenu.callSubMenu)(
        calledValue,
        menuData,
        userToSend,
        instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        part,
        allMenusWithData,
        menus,
        setStateIdsToListenTo
      );
      if (result && result.setStateIdsToListenTo) {
        setStateIdsToListenTo = result.setStateIdsToListenTo;
      }
      return true;
    }
    return false;
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error processData:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
function getStateIdsToListenTo() {
  return setStateIdsToListenTo;
}
function getTimeouts() {
  return timeouts;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkEveryMenuForData,
  getStateIdsToListenTo,
  getTimeouts
});
//# sourceMappingURL=processData.js.map
