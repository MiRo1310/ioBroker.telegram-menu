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
var setstate_exports = {};
__export(setstate_exports, {
  setState: () => setState
});
module.exports = __toCommonJS(setstate_exports);
var import_telegram = require("./telegram");
var import_utilities = require("../lib/utilities");
var import_dynamicValue = require("./dynamicValue");
var import_global = require("./global");
var import_main = __toESM(require("../main"));
var import_logging = require("./logging");
const modifiedValue = (valueFromSubmenu, value) => {
  if (value && value.includes("{value}")) {
    return value.replace("{value}", valueFromSubmenu);
  }
  return valueFromSubmenu;
};
const isDynamicValueToSet = async (value) => {
  const _this = import_main.default.getInstance();
  if (typeof value === "string" && value.includes("{id:")) {
    const result = (0, import_global.decomposeText)(value, "{id:", "}");
    const id = result.substring.replace("{id:", "").replace("}", "");
    const newValue = await _this.getForeignStateAsync(id);
    if (newValue && newValue.val && typeof newValue.val === "string") {
      return value.replace(result.substring, newValue.val);
    }
  }
  return value;
};
const setValue = async (id, value, SubmenuValuePriority, valueFromSubmenu, ack) => {
  try {
    const _this = import_main.default.getInstance();
    let valueToSet;
    SubmenuValuePriority ? valueToSet = modifiedValue(valueFromSubmenu, value) : valueToSet = await isDynamicValueToSet(value);
    await (0, import_utilities.checkTypeOfId)(id, valueToSet).then((val) => {
      valueToSet = val;
      (0, import_logging.debug)([{ text: "Value to Set:", val: valueToSet }]);
      if (valueToSet !== void 0 && valueToSet !== null) {
        _this.setForeignState(id, valueToSet, ack);
      }
    });
  } catch (error) {
    error([
      { text: "Error setValue", val: error.message },
      { text: "Stack", val: error.stack }
    ]);
  }
};
const setState = async (part, userToSend, valueFromSubmenu, SubmenuValuePriority, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID) => {
  const _this = import_main.default.getInstance();
  try {
    const setStateIds = [];
    if (!part.switch) {
      return;
    }
    for (const element of part.switch) {
      let ack = false;
      let returnText = element.returnText;
      ack = (element == null ? void 0 : element.ack) ? element.ack === "true" : false;
      if (returnText.includes("{setDynamicValue")) {
        const { confirmText, id } = await (0, import_dynamicValue.setDynamicValue)(
          returnText,
          ack,
          element.id,
          userToSend,
          telegramInstance,
          one_time_keyboard,
          resize_keyboard,
          userListWithChatID,
          element.parse_mode,
          element.confirm
        );
        if (element.confirm) {
          setStateIds.push({
            id: id || element.id,
            confirm: element.confirm,
            returnText: confirmText,
            userToSend
          });
          return setStateIds;
        }
      }
      if (!returnText.includes("{'id':'")) {
        setStateIds.push({
          id: element.id,
          confirm: element.confirm,
          returnText,
          userToSend,
          parse_mode: element.parse_mode
        });
      } else {
        returnText = returnText.replace(/'/g, '"');
        const textToSend = returnText.slice(0, returnText.indexOf("{")).trim();
        const returnObj = JSON.parse(returnText.slice(returnText.indexOf("{"), returnText.indexOf("}") + 1));
        returnObj.text = returnObj.text + returnText.slice(returnText.indexOf("}") + 1);
        if (textToSend && textToSend !== "") {
          await (0, import_telegram.sendToTelegram)({
            user: userToSend,
            textToSend,
            keyboard: void 0,
            instance: telegramInstance,
            resize_keyboard: one_time_keyboard,
            one_time_keyboard: resize_keyboard,
            userListWithChatID,
            parse_mode: element.parse_mode
          });
        }
        setStateIds.push({
          id: returnObj.id,
          confirm: true,
          returnText: returnObj.text,
          userToSend
        });
      }
      if (element.toggle) {
        _this.getForeignStateAsync(element.id).then((val) => {
          if (val) {
            _this.setForeignStateAsync(element.id, !val.val, ack).catch((e) => {
              (0, import_logging.errorLogger)("Error setForeignStateAsync:", e);
            });
          }
        }).catch((e) => {
          (0, import_logging.errorLogger)("Error getForeignStateAsync:", e);
        });
      } else {
        await setValue(element.id, element.value, SubmenuValuePriority, valueFromSubmenu, ack);
      }
    }
    return setStateIds;
  } catch (error) {
    (0, import_logging.errorLogger)("Error Switch", error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setState
});
//# sourceMappingURL=setstate.js.map
