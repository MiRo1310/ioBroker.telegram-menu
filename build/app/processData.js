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
  getStateIdsToListenTo: () => getStateIdsToListenTo,
  getTimeouts: () => getTimeouts
});
module.exports = __toCommonJS(processData_exports);
var import_main = require("../main");
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
var import_string = require("../lib/string");
let setStateIdsToListenTo = [];
let timeouts = [];
async function checkEveryMenuForData(obj) {
  const {
    menuData,
    calledValue,
    userToSend,
    instanceTelegram,
    resizeKeyboard,
    oneTimeKeyboard,
    userListWithChatID,
    menus,
    isUserActiveCheckbox,
    token,
    directoryPicture,
    timeoutKey
  } = obj;
  for (const menu of menus) {
    const groupData = menuData.data[menu];
    import_main.adapter.log.debug(`Menu: ${menu}`);
    import_main.adapter.log.debug(`Nav: ${(0, import_string.jsonString)(menuData.data[menu])}`);
    if (await processData({
      menuData,
      calledValue,
      userToSend,
      groupWithUser: menu,
      instanceTelegram,
      resizeKeyboard,
      oneTimeKeyboard,
      userListWithChatID,
      allMenusWithData: menuData.data,
      menus,
      isUserActiveCheckbox,
      token,
      directoryPicture,
      timeoutKey,
      groupData
    })) {
      import_main.adapter.log.debug("CalledText found");
      return true;
    }
  }
  return false;
}
async function processData(obj) {
  const {
    menuData,
    calledValue,
    userToSend,
    groupWithUser,
    instanceTelegram,
    resizeKeyboard,
    oneTimeKeyboard,
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
      if (valueToSet && (res == null ? void 0 : res.id)) {
        await import_main.adapter.setForeignStateAsync(res == null ? void 0 : res.id, valueToSet, res == null ? void 0 : res.ack);
      } else {
        await (0, import_telegram.sendToTelegram)({
          userToSend,
          textToSend: `You insert a wrong Type of value, please insert type: ${res == null ? void 0 : res.valueType}`,
          instanceTelegram,
          resizeKeyboard,
          oneTimeKeyboard,
          userListWithChatID
        });
      }
      (0, import_dynamicValue.removeUserFromDynamicValue)(userToSend);
      const result = await (0, import_backMenu.switchBack)(userToSend, allMenusWithData, menus, true);
      if (result) {
        await (0, import_telegram.sendToTelegram)({
          userToSend,
          textToSend: result.texttosend || "",
          keyboard: result.menuToSend,
          instanceTelegram,
          resizeKeyboard,
          oneTimeKeyboard,
          userListWithChatID,
          parseMode: result.parseMode
        });
      } else {
        await (0, import_sendNav.sendNav)(part, userToSend, instanceTelegram, userListWithChatID, resizeKeyboard, oneTimeKeyboard);
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
        import_main.adapter.log.debug(`Menu to Send: ${part.nav}`);
        (0, import_backMenu.backMenuFunc)(call, part.nav, userToSend);
        if (JSON.stringify(part.nav).includes("menu:")) {
          import_main.adapter.log.debug(`Submenu: ${part.nav}`);
          const result = await (0, import_subMenu.callSubMenu)(
            JSON.stringify(part.nav),
            groupData,
            userToSend,
            instanceTelegram,
            resizeKeyboard,
            oneTimeKeyboard,
            userListWithChatID,
            part,
            allMenusWithData,
            menus,
            setStateIdsToListenTo,
            part.nav
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
              resizeKeyboard,
              oneTimeKeyboard,
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
            resizeKeyboard,
            oneTimeKeyboard
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
          resizeKeyboard,
          oneTimeKeyboard,
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
        (0, import_getstate.getState)(part, userToSend, instanceTelegram, oneTimeKeyboard, resizeKeyboard, userListWithChatID);
        return true;
      }
      if (part.sendPic) {
        const result = (0, import_sendpic.sendPic)(
          part,
          userToSend,
          instanceTelegram,
          resizeKeyboard,
          oneTimeKeyboard,
          userListWithChatID,
          token,
          directoryPicture,
          timeouts,
          timeoutKey
        );
        if (result) {
          timeouts = result;
        } else {
          import_main.adapter.log.debug(`Timeouts not found`);
        }
        return true;
      }
      if (part.location) {
        import_main.adapter.log.debug("Send location");
        await (0, import_telegram.sendLocationToTelegram)(userToSend, part.location, instanceTelegram, userListWithChatID);
        return true;
      }
      if (part.echarts) {
        import_main.adapter.log.debug("Send echars");
        (0, import_echarts.getChart)(
          part.echarts,
          directoryPicture,
          userToSend,
          instanceTelegram,
          userListWithChatID,
          resizeKeyboard,
          oneTimeKeyboard
        );
        return true;
      }
      if (part.httpRequest) {
        import_main.adapter.log.debug("Send http request");
        const result = await (0, import_httpRequest.httpRequest)(
          part,
          userToSend,
          instanceTelegram,
          resizeKeyboard,
          oneTimeKeyboard,
          userListWithChatID,
          directoryPicture
        );
        if (result) {
          return true;
        }
      }
    }
    if ((calledValue.startsWith("menu") || calledValue.startsWith("submenu")) && menuData.data[groupWithUser][call]) {
      import_main.adapter.log.debug("Call Submenu");
      const result = await (0, import_subMenu.callSubMenu)(
        calledValue,
        menuData,
        userToSend,
        instanceTelegram,
        resizeKeyboard,
        oneTimeKeyboard,
        userListWithChatID,
        part,
        allMenusWithData,
        menus,
        setStateIdsToListenTo,
        part.nav
      );
      if (result && result.setStateIdsToListenTo) {
        setStateIdsToListenTo = result.setStateIdsToListenTo;
      }
      return true;
    }
    return false;
  } catch (e) {
    (0, import_logging.errorLogger)("Error processData:", e, import_main.adapter);
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
