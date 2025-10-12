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
var processData_exports = {};
__export(processData_exports, {
  checkEveryMenuForData: () => checkEveryMenuForData,
  getTimeouts: () => getTimeouts
});
module.exports = __toCommonJS(processData_exports);
var import_string = require("@b/lib/string");
var import_dynamicValue = require("@b/app/dynamicValue");
var import_action = require("@b/app/action");
var import_setstate = require("@b/app/setstate");
var import_telegram = require("@b/app/telegram");
var import_backMenu = require("@b/app/backMenu");
var import_sendNav = require("@b/app/sendNav");
var import_subMenu = require("@b/app/subMenu");
var import_getstate = require("@b/app/getstate");
var import_sendpic = require("@b/app/sendpic");
var import_echarts = require("@b/app/echarts");
var import_httpRequest = require("@b/app/httpRequest");
var import_validateMenus = require("@b/app/validateMenus");
var import_logging = require("@b/app/logging");
let timeouts = [];
async function checkEveryMenuForData({
  instance,
  menuData,
  navToGoTo,
  userToSend,
  telegramParams,
  menus,
  isUserActiveCheckbox,
  token,
  directoryPicture,
  timeoutKey
}) {
  const adapter = telegramParams.adapter;
  for (const menu of menus) {
    const groupData = menuData[menu];
    adapter.log.debug(`Menu : ${menu}`);
    adapter.log.debug(`Nav : ${(0, import_string.jsonString)(menuData[menu])}`);
    if (await processData({
      adapter,
      instance,
      menuData,
      calledValue: navToGoTo,
      userToSend,
      groupWithUser: menu,
      telegramParams,
      allMenusWithData: menuData,
      menus,
      isUserActiveCheckbox,
      token,
      directoryPicture,
      timeoutKey,
      groupData
    })) {
      adapter.log.debug("Menu found");
      return true;
    }
  }
  return false;
}
async function processData({
  instance,
  menuData,
  calledValue,
  userToSend,
  groupWithUser,
  telegramParams,
  allMenusWithData,
  menus,
  isUserActiveCheckbox,
  token,
  directoryPicture,
  timeoutKey,
  groupData,
  adapter
}) {
  try {
    let part = {};
    const dynamicValue = (0, import_dynamicValue.getDynamicValue)(userToSend);
    if (dynamicValue) {
      const valueToSet = (dynamicValue == null ? void 0 : dynamicValue.valueType) ? (0, import_action.adjustValueType)(adapter, calledValue, dynamicValue.valueType) : calledValue;
      valueToSet && (dynamicValue == null ? void 0 : dynamicValue.id) ? await (0, import_setstate.setstateIobroker)({ adapter, id: dynamicValue.id, value: valueToSet, ack: dynamicValue == null ? void 0 : dynamicValue.ack }) : await (0, import_telegram.sendToTelegram)({
        instance,
        userToSend,
        textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValue == null ? void 0 : dynamicValue.valueType}`,
        telegramParams
      });
      (0, import_dynamicValue.removeUserFromDynamicValue)(userToSend);
      const result = await (0, import_backMenu.switchBack)(adapter, userToSend, allMenusWithData, menus, true);
      if (result && !dynamicValue.navToGoTo) {
        const { textToSend, keyboard, parse_mode } = result;
        await (0, import_telegram.sendToTelegram)({ instance, userToSend, textToSend, keyboard, telegramParams, parse_mode });
        return true;
      }
      await (0, import_sendNav.sendNav)(adapter, instance, part, userToSend, telegramParams);
      return true;
    }
    const call = calledValue.includes("menu:") ? calledValue.split(":")[2] : calledValue;
    part = groupData[call];
    if (!calledValue.toString().includes("menu:") && isUserActiveCheckbox[groupWithUser]) {
      const nav = part == null ? void 0 : part.nav;
      if (nav) {
        adapter.log.debug(`Menu to Send: ${(0, import_string.jsonString)(nav)}`);
        (0, import_backMenu.backMenuFunc)({ activePage: call, navigation: nav, userToSend });
        if ((0, import_string.jsonString)(nav).includes("menu:")) {
          adapter.log.debug(`Submenu: ${(0, import_string.jsonString)(nav)}`);
          const result = await (0, import_subMenu.callSubMenu)({
            adapter,
            instance,
            jsonStringNav: (0, import_string.jsonString)(nav),
            userToSend,
            telegramParams,
            part,
            allMenusWithData,
            menus
          });
          if (result == null ? void 0 : result.newNav) {
            await checkEveryMenuForData({
              instance,
              menuData,
              navToGoTo: result.newNav,
              userToSend,
              telegramParams,
              menus,
              isUserActiveCheckbox,
              token,
              directoryPicture,
              timeoutKey
            });
          }
          return true;
        }
        await (0, import_sendNav.sendNav)(adapter, instance, part, userToSend, telegramParams);
        return true;
      }
      if (part == null ? void 0 : part.switch) {
        await (0, import_setstate.handleSetState)(instance, part, userToSend, null, telegramParams);
        return true;
      }
      if (part == null ? void 0 : part.getData) {
        await (0, import_getstate.getState)(instance, part, userToSend, telegramParams);
        return true;
      }
      if (part == null ? void 0 : part.sendPic) {
        timeouts = (0, import_sendpic.sendPic)(
          instance,
          part,
          userToSend,
          telegramParams,
          token,
          directoryPicture,
          timeouts,
          timeoutKey
        );
        return true;
      }
      if (part == null ? void 0 : part.location) {
        adapter.log.debug("Send location");
        await (0, import_telegram.sendLocationToTelegram)(instance, userToSend, part.location, telegramParams);
        return true;
      }
      if (part == null ? void 0 : part.echarts) {
        adapter.log.debug("Send echarts");
        (0, import_echarts.getChart)(instance, part.echarts, directoryPicture, userToSend, telegramParams);
        return true;
      }
      if (part == null ? void 0 : part.httpRequest) {
        adapter.log.debug("Send http request");
        const result = await (0, import_httpRequest.httpRequest)(adapter, instance, part, userToSend, telegramParams, directoryPicture);
        return !!result;
      }
    }
    if ((0, import_validateMenus.isSubmenuOrMenu)(calledValue) && menuData[groupWithUser][call]) {
      adapter.log.debug("Call Submenu");
      await (0, import_subMenu.callSubMenu)({
        adapter,
        instance,
        jsonStringNav: calledValue,
        userToSend,
        telegramParams,
        part,
        allMenusWithData,
        menus
      });
      return true;
    }
    return false;
  } catch (e) {
    (0, import_logging.errorLogger)("Error processData:", e, adapter);
  }
}
function getTimeouts() {
  return timeouts;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkEveryMenuForData,
  getTimeouts
});
//# sourceMappingURL=processData.js.map
