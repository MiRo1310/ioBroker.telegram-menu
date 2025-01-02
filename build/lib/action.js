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
var action_exports = {};
__export(action_exports, {
  adjustValueType: () => adjustValueType,
  bindingFunc: () => bindingFunc,
  calcValue: () => calcValue,
  checkEvent: () => checkEvent,
  editArrayButtons: () => editArrayButtons,
  exchangePlaceholderWithValue: () => exchangePlaceholderWithValue,
  generateActions: () => generateActions,
  generateNewObjectStructure: () => generateNewObjectStructure,
  getMenusWithUserToSend: () => getMenusWithUserToSend,
  getUserToSendFromUserListWithChatID: () => getUserToSendFromUserListWithChatID,
  idBySelector: () => idBySelector,
  roundValue: () => roundValue
});
module.exports = __toCommonJS(action_exports);
var import_telegram = require("./telegram.js");
var import_global = require("./global");
var import_subMenu = require("./subMenu.js");
var import_sendNav = require("./sendNav.js");
var import_backMenu = require("./backMenu.js");
var import_logging = require("./logging.js");
var import_main = __toESM(require("../main.js"));
const bindingFunc = async (text, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode) => {
  var _a;
  const _this = import_main.default.getInstance();
  let value;
  try {
    const substring = (0, import_global.decomposeText)(text, "binding:", "}").substring;
    const arrayOfItems = substring.replace("binding:{", "").replace("}", "").split(";");
    const bindingObject = {
      values: {}
    };
    for (let item of arrayOfItems) {
      if (!item.includes("?")) {
        const key = item.split(":")[0];
        const id = item.split(":")[1];
        const result = await _this.getForeignStateAsync(id);
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
    await (0, import_telegram.sendToTelegram)(
      userToSend,
      value,
      void 0,
      telegramInstance,
      one_time_keyboard,
      resize_keyboard,
      userListWithChatID,
      parse_mode
    );
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
};
function calcValue(_this, textToSend, val) {
  const { substring } = (0, import_global.decomposeText)(textToSend, "{math:", "}");
  const mathValue = substring.replace("{math:", "").replace("}", "");
  try {
    val = eval(val + mathValue);
    textToSend = textToSend.replace(substring, "");
    return { textToSend, val };
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error Eval:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
function checkValueForOneLine(text2) {
  if (!text2.includes("&&")) {
    return `${text2}&&`;
  }
  return text2;
}
function editArrayButtons(val2, _this2) {
  const newVal = [];
  try {
    val2.forEach((element) => {
      let value2 = "";
      if (typeof element.value === "string") {
        value2 = checkValueForOneLine(element.value);
      }
      let array = [];
      if (value2.indexOf("&&") != -1) {
        array = value2.split("&&");
      }
      if (array.length > 1) {
        array.forEach(function(element2, index) {
          if (typeof element2 === "string") {
            let navArray = element2.split(",");
            navArray = navArray.map((item2) => item2.trim());
            array[index] = navArray;
          }
        });
      } else if (typeof element.value === "string") {
        array = element.value.split(",");
        array.forEach(function(element2, index) {
          array[index] = [element2.trim()];
        });
      }
      newVal.push({ call: element.call, text: element.text, parse_mode: element.parse_mode, nav: array });
    });
    return newVal;
  } catch (err) {
    (0, import_logging.error)([
      { text: "Error EditArray:", val: err.message },
      { text: "Stack:", val: err.stack }
    ]);
    return null;
  }
}
const idBySelector = async (_this2, selector, text2, userToSend2, newline, telegramInstance2, one_time_keyboard2, resize_keyboard2, userListWithChatID2) => {
  let text2Send = "";
  try {
    if (!selector.includes("functions")) {
      return;
    }
    const functions = selector.replace("functions=", "");
    let enums = [];
    const result = await _this2.getEnumsAsync();
    if (!result || !result["enum.functions"][`enum.functions.${functions}`]) {
      return;
    }
    enums = result["enum.functions"][`enum.functions.${functions}`].common.members;
    if (!enums) {
      return;
    }
    const promises = enums.map(async (id) => {
      const value2 = await _this2.getForeignStateAsync(id);
      if (value2 && value2.val !== void 0 && value2.val !== null) {
        let newText = text2;
        let res;
        if (text2.includes("{common.name}")) {
          res = await _this2.getForeignObjectAsync(id);
          _this2.log.debug(`Name ${JSON.stringify(res == null ? void 0 : res.common.name)}`);
          if (res && res.common.name) {
            newText = newText.replace("{common.name}", res.common.name);
          }
        }
        if (text2.includes("&amp;&amp;")) {
          text2Send += newText.replace("&amp;&amp;", value2.val);
        } else if (text2.includes("&&")) {
          text2Send += newText.replace("&&", value2.val);
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
      _this2.log.debug(`text2send ${JSON.stringify(text2Send)}`);
    });
    Promise.all(promises).then(() => {
      (0, import_telegram.sendToTelegram)(
        userToSend2,
        text2Send,
        void 0,
        telegramInstance2,
        one_time_keyboard2,
        resize_keyboard2,
        userListWithChatID2,
        "false"
      ).catch((e) => {
        (0, import_logging.error)([
          { text: "Error SendToTelegram:", val: e.message },
          { text: "Stack:", val: e.stack }
        ]);
      });
      (0, import_logging.debug)([
        { text: "TextToSend:", val: text2Send },
        { text: "UserToSend:", val: userToSend2 }
      ]);
    }).catch((e) => {
      (0, import_logging.error)([
        { text: "Error Promise:", val: e.message },
        { text: "Stack:", val: e.stack }
      ]);
    });
  } catch (error2) {
    error2([
      { text: "Error idBySelector:", val: error2.message },
      { text: "Stack:", val: error2.stack }
    ]);
  }
};
function generateNewObjectStructure(val2) {
  try {
    if (!val2) {
      return null;
    }
    const obj = {};
    val2.forEach(function(element) {
      const call = element.call;
      obj[call] = {
        nav: element.nav,
        text: element.text,
        parse_mode: element.parse_mode == "true" || element.parse_mode == "false" ? element.parse_mode : "false"
      };
    });
    return obj;
  } catch (err) {
    (0, import_logging.error)([
      { text: "Error GenerateNewObjectStructure:", val: err.message },
      { text: "Stack:", val: err.stack }
    ]);
    return null;
  }
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
    action.set.forEach(function(element, key) {
      if (key == 0) {
        userObject[element.trigger[0]] = { switch: [] };
      }
      userObject[element.trigger[0]] = { switch: [] };
      element.IDs.forEach(function(id, index) {
        var _a;
        listOfSetStateIds.push(id);
        const toggle = element.switch_checkbox[index] === "true";
        let value2;
        if (element.values[index] === "true" || element.values[index] === "false") {
          value2 = element.values[index] === "true";
        } else {
          value2 = element.values[index];
        }
        const newObj = {
          id: element.IDs[index],
          value: value2.toString(),
          toggle,
          confirm: element.confirm[index],
          returnText: element.returnText[index],
          ack: element.ack ? element.ack[index] : "false",
          parse_mode: element.parse_mode ? element.parse_mode[0] : "false"
        };
        if (userObject[element.trigger[0]] && ((_a = userObject[element.trigger[0]]) == null ? void 0 : _a.switch)) {
          userObject[element.trigger[0]].switch.push(newObj);
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
            const newObj = {};
            item2.elements.forEach((elementItem) => {
              const name = elementItem.name;
              const value2 = elementItem.value ? elementItem.value : elementItem.name;
              const newKey = elementItem.key ? elementItem.key : key;
              let val2;
              if (!element[value2]) {
                val2 = false;
              } else {
                val2 = element[value2][newKey] || "false";
              }
              if (elementItem.type == "text" && typeof val2 === "string") {
                newObj[name] = val2.replace(/&amp;/g, "&");
              } else {
                newObj[name] = val2;
              }
            });
            if (item2.name && typeof item2.name === "string") {
              userObject[element.trigger][item2 == null ? void 0 : item2.name].push(
                newObj
              );
            }
          });
        });
      }
    });
    return { obj: userObject, ids: listOfSetStateIds };
  } catch (err) {
    (0, import_logging.error)([
      { text: "Error generateActions:", val: err.message },
      { text: "Stack:", val: err.stack }
    ]);
  }
}
function roundValue(val2, textToSend2) {
  try {
    const floatedNumber = parseFloat(val2);
    const { substring: substring2, textWithoutSubstring } = (0, import_global.decomposeText)(textToSend2, "{round:", "}");
    const decimalPlaces = substring2.split(":")[1].replace("}", "");
    const floatedString = floatedNumber.toFixed(parseInt(decimalPlaces));
    return { val: floatedString, textToSend: textWithoutSubstring };
  } catch (err) {
    (0, import_logging.error)([
      { text: "Error roundValue:", val: err.message },
      { text: "Stack:", val: err.stack }
    ]);
  }
}
const exchangePlaceholderWithValue = (textToSend2, text2) => {
  let searchString = "";
  if (textToSend2.includes("&&")) {
    searchString = "&&";
  } else if (textToSend2.includes("&amp;&amp;")) {
    searchString = "&amp;&amp;";
  }
  searchString !== "" && textToSend2.toString().indexOf(searchString) != -1 ? textToSend2 = textToSend2.replace(searchString, text2.toString()) : textToSend2 += ` ${text2}`;
  return textToSend2;
};
const adjustValueType = (value2, valueType) => {
  if (valueType == "number") {
    if (!parseFloat(value2)) {
      (0, import_logging.error)([{ text: "Error: Value is not a number:", val: value2 }]);
      return false;
    }
    return parseFloat(value2);
  }
  if (valueType == "boolean") {
    if (value2 == "true") {
      return true;
    }
    (0, import_logging.error)([{ text: "Error: Value is not a boolean:", val: value2 }]);
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
        if (usersInGroup[menu] && menuData.data[menu][calledNav]) {
          for (const user of usersInGroup[menu]) {
            const part = menuData.data[menu][calledNav];
            const menus = Object.keys(menuData.data);
            if (part.nav) {
              (0, import_backMenu.backMenuFunc)(calledNav, part.nav, user);
            }
            if (part && part.nav && JSON.stringify(part == null ? void 0 : part.nav[0]).includes("menu:")) {
              await (0, import_subMenu.callSubMenu)(
                JSON.stringify(part == null ? void 0 : part.nav[0]),
                menuData,
                user,
                instanceTelegram,
                resize_keyboard2,
                one_time_keyboard2,
                userListWithChatID2,
                part,
                menuData.data,
                menus,
                null
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
      (0, import_logging.debug)([
        { text: "User and ChatID:", val: element },
        { text: "User:", val: userToSend2 }
      ]);
      break;
    }
  }
  return userToSend2;
};
const getMenusWithUserToSend = (menusWithUsers, userToSend2) => {
  const menus = [];
  for (const key in menusWithUsers) {
    if (menusWithUsers[key].includes(userToSend2)) {
      menus.push(key);
    }
  }
  return menus;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adjustValueType,
  bindingFunc,
  calcValue,
  checkEvent,
  editArrayButtons,
  exchangePlaceholderWithValue,
  generateActions,
  generateNewObjectStructure,
  getMenusWithUserToSend,
  getUserToSendFromUserListWithChatID,
  idBySelector,
  roundValue
});
//# sourceMappingURL=action.js.map
