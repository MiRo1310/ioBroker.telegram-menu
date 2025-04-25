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
var action_exports = {};
__export(action_exports, {
  adjustValueType: () => adjustValueType,
  bindingFunc: () => bindingFunc,
  checkEvent: () => checkEvent,
  exchangePlaceholderWithValue: () => exchangePlaceholderWithValue,
  generateActions: () => generateActions,
  getNewStructure: () => getNewStructure,
  getUserToSendFromUserListWithChatID: () => getUserToSendFromUserListWithChatID,
  idBySelector: () => idBySelector,
  splitNavigation: () => splitNavigation
});
module.exports = __toCommonJS(action_exports);
var import_telegram = require("./telegram.js");
var import_subMenu = require("./subMenu.js");
var import_sendNav = require("./sendNav.js");
var import_backMenu = require("./backMenu.js");
var import_logging = require("./logging.js");
var import_main = require("../main.js");
var import_string = require("../lib/string");
var import_config = require("../config/config");
var import_appUtils = require("../lib/appUtils");
var import_utils = require("../lib/utils");
var import_object = require("../lib/object");
const bindingFunc = async (text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode) => {
  var _a;
  let value;
  try {
    const substring = (0, import_string.decomposeText)(text, "binding:", "}").substring;
    const arrayOfItems = substring.replace("binding:{", "").replace("}", "").split(";");
    const bindingObject = {
      values: {}
    };
    for (let item of arrayOfItems) {
      if (!item.includes("?")) {
        const key = item.split(":")[0];
        const id = item.split(":")[1];
        const result = await import_main.adapter.getForeignStateAsync(id);
        if (result) {
          bindingObject.values[key] = ((_a = result.val) == null ? void 0 : _a.toString()) || "";
        }
      } else {
        Object.keys(bindingObject.values).forEach(function(key) {
          item = item.replace(key, bindingObject.values[key]);
        });
        value = eval(item);
      }
    }
    await (0, import_telegram.sendToTelegram)({
      userToSend,
      textToSend: value,
      instanceTelegram: telegramInstance,
      resize_keyboard,
      one_time_keyboard,
      userListWithChatID,
      parse_mode
    });
  } catch (e) {
    (0, import_logging.errorLogger)("Error Binding function: ", e, import_main.adapter);
  }
};
function splitNavigation(rows) {
  const generatedNavigation = [];
  rows.forEach(({ value: value2, text: text2, parse_mode: parse_mode2, call }) => {
    const nav = [];
    (0, import_appUtils.checkOneLineValue)(value2).split(import_config.config.rowSplitter).forEach(function(el, index) {
      nav[index] = (0, import_object.trimAllItems)(el.split(","));
    });
    generatedNavigation.push({ call, text: text2, parse_mode: (0, import_utils.isTruthy)(parse_mode2), nav });
  });
  return generatedNavigation;
}
const idBySelector = async ({
  selector,
  text: text2,
  userToSend: userToSend2,
  newline,
  telegramInstance: telegramInstance2,
  one_time_keyboard: one_time_keyboard2,
  resize_keyboard: resize_keyboard2,
  userListWithChatID: userListWithChatID2
}) => {
  let text2Send = "";
  try {
    if (!selector.includes("functions")) {
      return;
    }
    const functions = selector.replace("functions=", "");
    let enums = [];
    const result = await import_main.adapter.getEnumsAsync();
    if (!result || !result["enum.functions"][`enum.functions.${functions}`]) {
      return;
    }
    enums = result["enum.functions"][`enum.functions.${functions}`].common.members;
    if (!enums) {
      return;
    }
    const promises = enums.map(async (id) => {
      const value2 = await import_main.adapter.getForeignStateAsync(id);
      if (value2 && value2.val !== void 0 && value2.val !== null) {
        let newText = text2;
        let res;
        if (text2.includes("{common.name}")) {
          res = await import_main.adapter.getForeignObjectAsync(id);
          import_main.adapter.log.debug(`Name ${JSON.stringify(res == null ? void 0 : res.common.name)}`);
          if (res && typeof res.common.name === "string") {
            newText = newText.replace("{common.name}", res.common.name);
          }
        }
        if (text2.includes("&amp;&amp;")) {
          text2Send += newText.replace("&amp;&amp;", String(value2.val));
        } else if (text2.includes("&&")) {
          text2Send += newText.replace("&&", String(value2.val));
        } else {
          text2Send += newText;
          text2Send += ` ${value2.val}`;
        }
      }
      if (newline === "true") {
        text2Send += " \n";
      } else {
        text2Send += " ";
      }
      import_main.adapter.log.debug(`text2send ${JSON.stringify(text2Send)}`);
    });
    Promise.all(promises).then(() => {
      (0, import_telegram.sendToTelegram)({
        userToSend: userToSend2,
        textToSend: text2Send,
        instanceTelegram: telegramInstance2,
        resize_keyboard: resize_keyboard2,
        one_time_keyboard: one_time_keyboard2,
        userListWithChatID: userListWithChatID2
      }).catch((e) => {
        (0, import_logging.errorLogger)("Error SendToTelegram:", e, import_main.adapter);
      });
      import_main.adapter.log.debug(`TextToSend: ${text2Send}`);
      import_main.adapter.log.debug(`UserToSend: ${userToSend2}`);
    }).catch((e) => {
      (0, import_logging.errorLogger)("Error Promise:", e, import_main.adapter);
    });
  } catch (error) {
    (0, import_logging.errorLogger)("Error idBySelector: ", error, import_main.adapter);
  }
};
function getNewStructure(val) {
  const obj = {};
  val.forEach(function({ nav, text: text2, parse_mode: parse_mode2, call }) {
    obj[call] = { nav, text: text2, parse_mode: parse_mode2 };
  });
  return obj;
}
function generateActions(action, userObject) {
  try {
    const arrayOfEntries = [
      {
        objName: "echarts",
        name: "echarts",
        loop: "preset",
        elements: [
          { name: "preset" },
          { name: "echartInstance" },
          { name: "background" },
          { name: "theme" },
          { name: "filename" }
        ]
      },
      {
        objName: "loc",
        name: "location",
        loop: "latitude",
        elements: [{ name: "latitude" }, { name: "longitude" }, { name: "parse_mode", key: 0 }]
      },
      {
        objName: "pic",
        name: "sendPic",
        loop: "IDs",
        elements: [
          { name: "id", value: "IDs" },
          { name: "fileName" },
          { name: "delay", value: "picSendDelay" }
        ]
      },
      {
        objName: "get",
        name: "getData",
        loop: "IDs",
        elements: [
          { name: "id", value: "IDs" },
          { name: "text", type: "text" },
          { name: "newline", value: "newline_checkbox" },
          { name: "parse_mode", key: 0 }
        ]
      },
      {
        objName: "httpRequest",
        name: "httpRequest",
        loop: "url",
        elements: [{ name: "url" }, { name: "user" }, { name: "password" }, { name: "filename" }]
      }
    ];
    const listOfSetStateIds = [];
    action.set.forEach(function({ trigger, switch_checkbox, returnText, parse_mode: parse_mode2, values, confirm, ack, IDs }, key) {
      if (key == 0) {
        userObject[trigger[0]] = { switch: [] };
      }
      userObject[trigger[0]] = { switch: [] };
      IDs.forEach(function(id, index) {
        var _a;
        listOfSetStateIds.push(id);
        const toggle = switch_checkbox[index] === "true";
        let value2;
        if (values[index] === "true" || values[index] === "false") {
          value2 = values[index] === "true";
        } else {
          value2 = values[index];
        }
        const newObj = {
          id: IDs[index],
          value: value2.toString(),
          toggle,
          confirm: confirm[index],
          returnText: returnText[index],
          ack: ack ? ack[index] : "false",
          parse_mode: (0, import_utils.isTruthy)(parse_mode2[0])
        };
        if (userObject[trigger[0]] && ((_a = userObject[trigger[0]]) == null ? void 0 : _a.switch)) {
          userObject[trigger[0]].switch.push(newObj);
        }
      });
    });
    arrayOfEntries.forEach((item2) => {
      if (action[item2.objName]) {
        action[item2.objName].forEach(function(element, index) {
          userObject[element.trigger[0]] = { [item2.name]: [] };
          if (index == 0) {
            userObject[element.trigger[0]] = { [item2.name]: [] };
          }
          element[item2.loop].forEach(function(id, key) {
            var _a;
            const newObj = {};
            item2.elements.forEach((elementItem) => {
              const name = elementItem.name;
              const value2 = elementItem.value ? elementItem.value : elementItem.name;
              const newKey = elementItem.key ? elementItem.key : key;
              let val;
              if (!element[value2]) {
                val = false;
              } else {
                val = element[value2][newKey] || "false";
              }
              if (elementItem.type == "text" && typeof val === "string") {
                newObj[name] = val.replace(/&amp;/g, "&");
              } else {
                newObj[name] = val;
              }
            });
            if (item2.name) {
              ((_a = userObject == null ? void 0 : userObject[element.trigger]) == null ? void 0 : _a[item2 == null ? void 0 : item2.name]).push(newObj);
            }
          });
        });
      }
    });
    return { obj: userObject, ids: listOfSetStateIds };
  } catch (err) {
    (0, import_logging.errorLogger)("Error generateActions:", err, import_main.adapter);
  }
}
const exchangePlaceholderWithValue = (textToSend, val) => {
  let searchString = "";
  if (textToSend.includes("&&")) {
    searchString = "&&";
  } else if (textToSend.includes("&amp;&amp;")) {
    searchString = "&amp;&amp;";
  }
  searchString !== "" && textToSend.toString().indexOf(searchString) != -1 ? textToSend = textToSend.replace(searchString, val.toString()) : textToSend += ` ${val}`;
  return textToSend;
};
const adjustValueType = (value2, valueType) => {
  if (valueType == "number") {
    if (!parseFloat(value2)) {
      import_main.adapter.log.error(`Error: Value is not a number: ${value2}`);
      return false;
    }
    return parseFloat(value2);
  }
  if (valueType == "boolean") {
    if (value2 == "true") {
      return true;
    }
    import_main.adapter.log.error(`Error: Value is not a boolean: ${value2}`);
    return false;
  }
  return value2;
};
const checkEvent = async (dataObject, id, state, menuData, userListWithChatID2, instanceTelegram, resize_keyboard2, one_time_keyboard2, usersInGroup) => {
  const menuArray = [];
  let ok = false;
  let calledNav = "";
  Object.keys(dataObject.action).forEach((menu) => {
    if (dataObject.action[menu] && dataObject.action[menu].events) {
      dataObject.action[menu].events.forEach((event) => {
        if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
          if ((state.val == true || state.val == "true") && event.condition == "true") {
            ok = true;
            menuArray.push(menu);
            calledNav = event.menu[0];
          } else if ((state.val == false || state.val == "false") && event.condition[0] == "false") {
            ok = true;
            menuArray.push(menu);
            calledNav = event.menu[0];
          } else if (typeof state.val == "number" && state.val == parseInt(event.condition[0])) {
            ok = true;
            menuArray.push(menu);
            calledNav = event.menu[0];
          } else if (state.val == event.condition[0]) {
            ok = true;
            menuArray.push(menu);
            calledNav = event.menu[0];
          }
        }
      });
    }
  });
  if (ok) {
    if (menuArray.length >= 1) {
      for (const menu of menuArray) {
        if (usersInGroup[menu] && menuData[menu][calledNav]) {
          for (const user of usersInGroup[menu]) {
            const part = menuData[menu][calledNav];
            const menus = Object.keys(menuData);
            if (part.nav) {
              (0, import_backMenu.backMenuFunc)({ nav: calledNav, part: part.nav, userToSend: user });
            }
            if ((part == null ? void 0 : part.nav) && (part == null ? void 0 : part.nav[0][0].includes("menu:"))) {
              await (0, import_subMenu.callSubMenu)(
                JSON.stringify(part == null ? void 0 : part.nav[0]),
                menuData,
                user,
                instanceTelegram,
                resize_keyboard2,
                one_time_keyboard2,
                userListWithChatID2,
                part,
                menuData,
                menus,
                null,
                part.nav
              );
            } else {
              await (0, import_sendNav.sendNav)(
                part,
                user,
                instanceTelegram,
                userListWithChatID2,
                resize_keyboard2,
                one_time_keyboard2
              );
            }
          }
        }
      }
    }
  }
  return ok;
};
const getUserToSendFromUserListWithChatID = (userListWithChatID2, chatID) => {
  let userToSend2 = null;
  for (const element of userListWithChatID2) {
    if (element.chatID == chatID) {
      userToSend2 = element.name;
      break;
    }
  }
  return userToSend2;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adjustValueType,
  bindingFunc,
  checkEvent,
  exchangePlaceholderWithValue,
  generateActions,
  getNewStructure,
  getUserToSendFromUserListWithChatID,
  idBySelector,
  splitNavigation
});
//# sourceMappingURL=action.js.map
