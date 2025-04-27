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
  generateActions: () => generateActions,
  getUserToSendFromUserListWithChatID: () => getUserToSendFromUserListWithChatID,
  idBySelector: () => idBySelector
});
module.exports = __toCommonJS(action_exports);
var import_telegram = require("./telegram");
var import_subMenu = require("./subMenu");
var import_sendNav = require("./sendNav");
var import_backMenu = require("./backMenu");
var import_logging = require("./logging");
var import_main = require("../main");
var import_string = require("../lib/string");
var import_utils = require("../lib/utils");
var import_math = require("../lib/math");
var import_config = require("../config/config");
const bindingFunc = async (text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode) => {
  var _a, _b;
  let textToSend;
  try {
    const { substringExcludeSearch } = (0, import_string.decomposeText)(text, import_config.config.binding.start, import_config.config.binding.end);
    const arrayOfItems = substringExcludeSearch.split(import_config.config.binding.splitChar);
    const bindingObject = {
      values: {}
    };
    for (let item of arrayOfItems) {
      if (!item.includes("?")) {
        const array = item.split(":");
        const key = array[0];
        const id = array[1];
        const result = await import_main.adapter.getForeignStateAsync(id);
        if (result) {
          bindingObject.values[key] = (_b = (_a = result.val) == null ? void 0 : _a.toString()) != null ? _b : "";
        }
      } else {
        Object.keys(bindingObject.values).forEach(function(key) {
          item = item.replace(key, bindingObject.values[key]);
        });
        const { val } = (0, import_math.evaluate)(item, import_main.adapter);
        textToSend = String(val);
      }
    }
    await (0, import_telegram.sendToTelegram)({
      userToSend,
      textToSend,
      telegramInstance,
      resize_keyboard,
      one_time_keyboard,
      userListWithChatID,
      parse_mode
    });
  } catch (e) {
    (0, import_logging.errorLogger)("Error Binding function: ", e, import_main.adapter);
  }
};
const idBySelector = async ({
  selector,
  text,
  userToSend,
  newline,
  telegramInstance,
  one_time_keyboard,
  resize_keyboard,
  userListWithChatID
}) => {
  let text2Send = "";
  try {
    const functions = selector.replace(import_config.config.functionSelektor, "");
    let enums = [];
    const result = await import_main.adapter.getEnumsAsync();
    if (!(result == null ? void 0 : result["enum.functions"][`enum.functions.${functions}`])) {
      return;
    }
    enums = result["enum.functions"][`enum.functions.${functions}`].common.members;
    if (!enums) {
      return;
    }
    const promises = enums.map(async (id) => {
      const value = await import_main.adapter.getForeignStateAsync(id);
      if ((0, import_utils.isDefined)(value == null ? void 0 : value.val)) {
        let newText = text;
        let res;
        if (text.includes("{common.name}")) {
          res = await import_main.adapter.getForeignObjectAsync(id);
          import_main.adapter.log.debug(`Name ${(0, import_string.jsonString)(res == null ? void 0 : res.common.name)}`);
          if (res && typeof res.common.name === "string") {
            newText = newText.replace("{common.name}", res.common.name);
          }
        }
        if (text.includes("&amp;&amp;")) {
          text2Send += newText.replace("&amp;&amp;", String(value.val));
        } else if (text.includes("&&")) {
          text2Send += newText.replace("&&", String(value.val));
        } else {
          text2Send += newText;
          text2Send += ` ${value.val}`;
        }
      }
      text2Send += (0, import_string.getNewline)(newline);
      import_main.adapter.log.debug(`text2send ${JSON.stringify(text2Send)}`);
    });
    Promise.all(promises).then(async () => {
      await (0, import_telegram.sendToTelegram)({
        userToSend,
        textToSend: text2Send,
        telegramInstance,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID
      });
    }).catch((e) => {
      (0, import_logging.errorLogger)("Error Promise:", e, import_main.adapter);
    });
  } catch (error) {
    (0, import_logging.errorLogger)("Error idBySelector: ", error, import_main.adapter);
  }
};
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
    action.set.forEach(function({ trigger, switch_checkbox, returnText, parse_mode, values, confirm, ack, IDs }, key) {
      const triggerName = trigger[0];
      if (key == 0) {
        userObject[triggerName] = { switch: [] };
      }
      userObject[triggerName] = { switch: [] };
      IDs.forEach(function(id, index) {
        var _a;
        listOfSetStateIds.push(id);
        const toggle = (0, import_utils.isTruthy)(switch_checkbox[index]);
        const newObj = {
          id: IDs[index],
          value: values[index],
          toggle,
          confirm: confirm[index],
          returnText: returnText[index],
          ack: (0, import_utils.isTruthy)(ack[index]),
          parse_mode: (0, import_utils.isTruthy)(parse_mode[0])
        };
        if (Array.isArray((_a = userObject[triggerName]) == null ? void 0 : _a.switch)) {
          userObject[triggerName].switch.push(newObj);
        }
      });
    });
    arrayOfEntries.forEach((item) => {
      if (action[item.objName]) {
        action[item.objName].forEach(function(element, index) {
          const trigger = element.trigger[0];
          userObject[trigger] = { [item.name]: [] };
          if (index == 0) {
            userObject[trigger] = { [item.name]: [] };
          }
          element[item.loop].forEach(function(id, key) {
            var _a;
            const newObj = {};
            item.elements.forEach(({ name, value, key: elKey }) => {
              const elName = value ? value : name;
              const newKey = elKey ? elKey : key;
              const val = !element[elName] ? false : element[elName][newKey] || "false";
              if (name === "parse_mode") {
                newObj.parse_mode = (0, import_utils.isTruthy)(val);
              }
              if (typeof val === "string") {
                newObj[name] = val.replace(/&amp;/g, "&");
              }
            });
            ((_a = userObject == null ? void 0 : userObject[trigger]) == null ? void 0 : _a[item.name]).push(newObj);
          });
        });
      }
    });
    return { obj: userObject, ids: listOfSetStateIds };
  } catch (err) {
    (0, import_logging.errorLogger)("Error generateActions:", err, import_main.adapter);
  }
}
const adjustValueType = (value, valueType) => {
  if (valueType == "number") {
    if (!parseFloat(value)) {
      import_main.adapter.log.error(`Error: Value is not a number: ${value}`);
      return false;
    }
    return parseFloat(value);
  }
  if (valueType == "boolean") {
    if (value == "true") {
      return true;
    }
    import_main.adapter.log.error(`Error: Value is not a boolean: ${value}`);
    return false;
  }
  return value;
};
const checkEvent = async (dataObject, id, state, menuData, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, usersInGroup) => {
  const menuArray = [];
  let ok = false;
  let calledNav = "";
  Object.keys(dataObject.action).forEach((menu) => {
    var _a;
    if ((_a = dataObject.action[menu]) == null ? void 0 : _a.events) {
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
              (0, import_backMenu.backMenuFunc)({ startSide: calledNav, navigation: part.nav, userToSend: user });
            }
            if ((part == null ? void 0 : part.nav) && (part == null ? void 0 : part.nav[0][0].includes("menu:"))) {
              await (0, import_subMenu.callSubMenu)(
                JSON.stringify(part == null ? void 0 : part.nav[0]),
                menuData,
                user,
                instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
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
                userListWithChatID,
                resize_keyboard,
                one_time_keyboard
              );
            }
          }
        }
      }
    }
  }
  return ok;
};
const getUserToSendFromUserListWithChatID = (userListWithChatID, chatID) => {
  let userToSend = null;
  for (const element of userListWithChatID) {
    if (element.chatID == chatID) {
      userToSend = element.name;
      break;
    }
  }
  return userToSend;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adjustValueType,
  bindingFunc,
  checkEvent,
  generateActions,
  getUserToSendFromUserListWithChatID,
  idBySelector
});
//# sourceMappingURL=action.js.map
