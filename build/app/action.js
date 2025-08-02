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
  getUserToSendFromUserListWithChatID: () => getUserToSendFromUserListWithChatID
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
var import_splitValues = require("../lib/splitValues");
const bindingFunc = async (text, userToSend, telegramParams, parse_mode) => {
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
        const { key, id } = (0, import_splitValues.getBindingValues)(item);
        if (id) {
          const result = await import_main.adapter.getForeignStateAsync(id);
          if (result) {
            bindingObject.values[key] = (_b = (_a = result.val) == null ? void 0 : _a.toString()) != null ? _b : "";
          }
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
      telegramParams,
      parse_mode
    });
  } catch (e) {
    (0, import_logging.errorLogger)("Error Binding function: ", e, import_main.adapter);
  }
};
function generateActions({
  action,
  userObject
}) {
  try {
    const listOfSetStateIds = [];
    action == null ? void 0 : action.set.forEach(function({ trigger, switch_checkbox, returnText, parse_mode, values, confirm, ack, IDs }, index) {
      const triggerName = trigger[0];
      if (index == 0) {
        userObject[triggerName] = { switch: [] };
      }
      userObject[triggerName] = { switch: [] };
      IDs.forEach(function(id, index2) {
        var _a;
        listOfSetStateIds.push(id);
        const toggle = (0, import_utils.isTruthy)(switch_checkbox[index2]);
        const newObj = {
          id: IDs[index2],
          value: values[index2],
          toggle,
          confirm: confirm[index2],
          returnText: returnText[index2],
          ack: (ack == null ? void 0 : ack.length) ? (0, import_utils.isTruthy)(ack[index2]) : false,
          parse_mode: (parse_mode == null ? void 0 : parse_mode.length) ? (0, import_utils.isTruthy)(parse_mode == null ? void 0 : parse_mode[0]) : false
        };
        if (Array.isArray((_a = userObject == null ? void 0 : userObject[triggerName]) == null ? void 0 : _a.switch)) {
          userObject[triggerName].switch.push(newObj);
        }
      });
    });
    import_config.arrayOfEntries.forEach((item) => {
      const actions = action == null ? void 0 : action[item.objName];
      actions == null ? void 0 : actions.forEach(function(element, index) {
        const trigger = element == null ? void 0 : element.trigger[0];
        userObject[trigger] = { [item.name]: [] };
        if (index == 0) {
          userObject[trigger] = { [item.name]: [] };
        }
        element[item.loop].forEach(function(id, index2) {
          var _a;
          const newObj = {};
          item.elements.forEach(({ name, value, index: elIndex }) => {
            var _a2;
            const elName = value ? value : name;
            const newIndex = elIndex ? elIndex : index2;
            const val = !element[elName] ? false : (_a2 = element[elName][newIndex]) != null ? _a2 : "false";
            if (name === "parse_mode") {
              newObj.parse_mode = (0, import_utils.isTruthy)(val);
            }
            if (typeof val === "string") {
              newObj[name] = String(val).replace(/&amp;/g, "&");
            }
          });
          ((_a = userObject == null ? void 0 : userObject[trigger]) == null ? void 0 : _a[item.name]).push(newObj);
        });
      });
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
    return (0, import_utils.isTruthy)(value);
  }
  return value;
};
const checkEvent = async (dataObject, id, state, menuData, telegramParams, usersInGroup) => {
  var _a;
  const menuArray = [];
  let ok = false;
  let calledNav = "";
  if (!dataObject.action) {
    return false;
  }
  Object.keys(dataObject.action).forEach((menu) => {
    var _a2, _b;
    if ((_b = (_a2 = dataObject.action) == null ? void 0 : _a2[menu]) == null ? void 0 : _b.events) {
      dataObject.action[menu].events.forEach((event) => {
        if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
          const condition = event.condition[0];
          if ((state.val == true || state.val == "true") && (0, import_utils.isTruthy)(condition) || (state.val == false || state.val == "false") && (0, import_utils.isFalsy)(condition) || typeof state.val == "number" && state.val == parseInt(condition) || state.val == condition) {
            ok = true;
            menuArray.push(menu);
            calledNav = event.menu[0];
          }
        }
      });
    }
  });
  if (!ok || !menuArray.length) {
    return false;
  }
  for (const menu of menuArray) {
    const part = menuData[menu][calledNav];
    if (usersInGroup[menu] && part) {
      for (const user of usersInGroup[menu]) {
        const menus = Object.keys(menuData);
        if (part.nav) {
          (0, import_backMenu.backMenuFunc)({ activePage: calledNav, navigation: part.nav, userToSend: user.name });
        }
        if ((_a = part == null ? void 0 : part.nav) == null ? void 0 : _a[0][0].includes("menu:")) {
          await (0, import_subMenu.callSubMenu)({
            jsonStringNav: part.nav[0][0],
            userToSend: user.name,
            telegramParams,
            part,
            allMenusWithData: menuData,
            menus
          });
          return true;
        }
        await (0, import_sendNav.sendNav)(part, user.name, telegramParams);
      }
    }
  }
  return true;
};
const getUserToSendFromUserListWithChatID = (userListWithChatID, chatID) => {
  for (const element of userListWithChatID) {
    if (element.chatID == chatID) {
      return element;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adjustValueType,
  bindingFunc,
  checkEvent,
  generateActions,
  getUserToSendFromUserListWithChatID
});
//# sourceMappingURL=action.js.map
