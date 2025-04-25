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
var setstate_exports = {};
__export(setstate_exports, {
  setState: () => setState
});
module.exports = __toCommonJS(setstate_exports);
var import_telegram = require("./telegram");
var import_utilities = require("../lib/utilities");
var import_dynamicValue = require("./dynamicValue");
var import_main = require("../main");
var import_logging = require("./logging");
var import_string = require("../lib/string");
const modifiedValue = (valueFromSubmenu, value) => {
  if (value && value.includes("{value}")) {
    return value.replace("{value}", valueFromSubmenu);
  }
  return valueFromSubmenu;
};
const isDynamicValueToSet = async (value) => {
  if (typeof value === "string" && value.includes("{id:")) {
    const result = (0, import_string.decomposeText)(value, "{id:", "}");
    const id = result.substring.replace("{id:", "").replace("}", "");
    const newValue = await import_main.adapter.getForeignStateAsync(id);
    if (newValue && newValue.val && typeof newValue.val === "string") {
      return value.replace(result.substring, newValue.val);
    }
  }
  return value;
};
const setValue = async (id, value, SubmenuValuePriority, valueFromSubmenu, ack) => {
  try {
    let valueToSet;
    SubmenuValuePriority ? valueToSet = modifiedValue(valueFromSubmenu, value) : valueToSet = await isDynamicValueToSet(value);
    await (0, import_utilities.checkTypeOfId)(id, valueToSet).then((val) => {
      valueToSet = val;
      import_main.adapter.log.debug(`Value to Set: ${(0, import_string.jsonString)(valueToSet)}`);
      if (valueToSet !== void 0 && valueToSet !== null) {
        import_main.adapter.setForeignState(id, valueToSet, ack);
      }
    });
  } catch (error) {
    (0, import_logging.errorLogger)("Error setValue", error, import_main.adapter);
  }
};
const setState = async (part, userToSend, valueFromSubmenu, SubmenuValuePriority, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID) => {
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
            userToSend,
            textToSend,
            telegramInstance,
            resize_keyboard,
            one_time_keyboard,
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
        import_main.adapter.getForeignStateAsync(element.id).then((val) => {
          if (val) {
            import_main.adapter.setForeignStateAsync(element.id, !val.val, ack).catch((e) => {
              (0, import_logging.errorLogger)("Error setForeignStateAsync:", e, import_main.adapter);
            });
          }
        }).catch((e) => {
          (0, import_logging.errorLogger)("Error getForeignStateAsync:", e, import_main.adapter);
        });
      } else {
        await setValue(element.id, element.value, SubmenuValuePriority, valueFromSubmenu, ack);
      }
    }
    return setStateIds;
  } catch (error) {
    (0, import_logging.errorLogger)("Error Switch", error, import_main.adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setState
});
//# sourceMappingURL=setstate.js.map
