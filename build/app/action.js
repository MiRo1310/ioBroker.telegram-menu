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
var import_splitValues = require("../lib/splitValues");
var import_appUtils = require("../lib/appUtils");
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
function getCommonName({ name, adapter: adapter2 }) {
  var _a, _b;
  const language = (_a = adapter2.language) != null ? _a : "en";
  if (!name) {
    return "";
  }
  if (typeof name === "string") {
    return name;
  }
  if (language) {
    return (_b = name[language]) != null ? _b : "";
  }
  return "";
}
function removeLastPartOfId(id) {
  const parts = id.split(".");
  parts.pop();
  return parts.join(".");
}
const idBySelector = async ({
  selector,
  text,
  userToSend,
  newline,
  telegramParams
}) => {
  let text2Send = "";
  try {
    const functions = selector.replace(import_config.config.functionSelektor, "");
    let enums = [];
    const result = await import_main.adapter.getEnumsAsync();
    const enumsFunctions = result == null ? void 0 : result["enum.functions"][`enum.functions.${functions}`];
    if (!enumsFunctions) {
      return;
    }
    enums = enumsFunctions.common.members;
    if (!enums) {
      return;
    }
    const promises = enums.map(async (id) => {
      var _a;
      const value = await import_main.adapter.getForeignStateAsync(id);
      let newText = text;
      if (text.includes("{common.name}")) {
        const result2 = await import_main.adapter.getForeignObjectAsync(id);
        newText = newText.replace("{common.name}", getCommonName({ name: result2 == null ? void 0 : result2.common.name, adapter: import_main.adapter }));
      }
      if (text.includes("{folder.name}")) {
        const result2 = await import_main.adapter.getForeignObjectAsync(removeLastPartOfId(id));
        newText = newText.replace("{folder.name}", getCommonName({ name: result2 == null ? void 0 : result2.common.name, adapter: import_main.adapter }));
      }
      const { textToSend } = (0, import_appUtils.exchangeValue)(import_main.adapter, newText, (_a = value == null ? void 0 : value.val) != null ? _a : "");
      text2Send += textToSend;
      text2Send += (0, import_string.getNewline)(newline);
      import_main.adapter.log.debug(`Text to send:  ${JSON.stringify(text2Send)}`);
    });
    Promise.all(promises).then(async () => {
      await (0, import_telegram.sendToTelegram)({
        userToSend,
        textToSend: text2Send,
        telegramParams
      });
    }).catch((e) => {
      (0, import_logging.errorLogger)("Error Promise", e, import_main.adapter);
    });
  } catch (error) {
    (0, import_logging.errorLogger)("Error idBySelector", error, import_main.adapter);
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
        var _a, _b;
        listOfSetStateIds.push(id);
        const toggle = (0, import_utils.isTruthy)(switch_checkbox[index2]);
        const newObj = {
          id: IDs[index2],
          value: values[index2],
          toggle,
          confirm: confirm[index2],
          returnText: returnText[index2],
          ack: (0, import_utils.isTruthy)((_a = ack == null ? void 0 : ack[index2]) != null ? _a : false),
          parse_mode: (0, import_utils.isTruthy)(parse_mode[0])
        };
        if (Array.isArray((_b = userObject[triggerName]) == null ? void 0 : _b.switch)) {
          userObject[triggerName].switch.push(newObj);
        }
      });
    });
    import_config.arrayOfEntries.forEach((item) => {
      const actions = action == null ? void 0 : action[item.objName];
      actions == null ? void 0 : actions.forEach(function(element, index) {
        const trigger = element.trigger[0];
        userObject[trigger] = { [item.name]: [] };
        if (index == 0) {
          userObject[trigger] = { [item.name]: [] };
        }
        element[item.loop].forEach(function(id, index2) {
          var _a;
          const newObj = {};
          item.elements.forEach(({ name, value, index: elIndex }) => {
            const elName = value ? value : name;
            const newIndex = elIndex ? elIndex : index2;
            const val = !element[elName] ? false : element[elName][newIndex] || "false";
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
          (0, import_backMenu.backMenuFunc)({ activePage: calledNav, navigation: part.nav, userToSend: user });
        }
        if ((_a = part == null ? void 0 : part.nav) == null ? void 0 : _a[0][0].includes("menu:")) {
          await (0, import_subMenu.callSubMenu)({
            jsonStringNav: part.nav[0][0],
            userToSend: user,
            telegramParams,
            part,
            allMenusWithData: menuData,
            menus
          });
          return true;
        }
        await (0, import_sendNav.sendNav)(part, user, telegramParams);
      }
    }
  }
  return true;
};
const getUserToSendFromUserListWithChatID = (userListWithChatID, chatID) => {
  for (const element of userListWithChatID) {
    if (element.chatID == chatID) {
      return element.name;
    }
  }
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
