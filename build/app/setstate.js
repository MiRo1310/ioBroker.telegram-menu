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
var import_utils = require("../lib/utils");
var import_config = require("../config/config");
const modifiedValue = (valueFromSubmenu, value) => {
  return value.includes(import_config.config.modifiedValue) ? value.replace(import_config.config.modifiedValue, valueFromSubmenu) : valueFromSubmenu;
};
const isDynamicValueToSet = async (value) => {
  if (typeof value === "string" && value.includes(import_config.config.dynamicValue.start)) {
    const { substring, substringExcludeSearch: id } = (0, import_string.decomposeText)(
      value,
      import_config.config.dynamicValue.start,
      import_config.config.dynamicValue.end
    );
    const newValue = await import_main.adapter.getForeignStateAsync(id);
    if (typeof (newValue == null ? void 0 : newValue.val) === "string") {
      return value.replace(substring, newValue.val);
    }
  }
  return value;
};
const setValue = async (id, value, SubmenuValuePriority, valueFromSubmenu, ack) => {
  try {
    const valueToSet = SubmenuValuePriority ? modifiedValue(valueFromSubmenu, value) : await isDynamicValueToSet(value);
    const val = await (0, import_utilities.transformValueToTypeOfId)(id, valueToSet);
    import_main.adapter.log.debug(`Value to Set: ${(0, import_string.jsonString)(val)}`);
    if ((0, import_utils.isDefined)(val)) {
      import_main.adapter.setForeignState(id, val, ack);
    }
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
    for (const { returnText: text, id: ID, parse_mode, confirm, ack, toggle, value } of part.switch) {
      let returnText = text;
      if (returnText.includes(import_config.config.setDynamicValue)) {
        const { confirmText, id } = await (0, import_dynamicValue.setDynamicValue)(
          returnText,
          (0, import_utils.isTruthy)(ack),
          ID,
          userToSend,
          telegramInstance,
          one_time_keyboard,
          resize_keyboard,
          userListWithChatID,
          parse_mode,
          confirm
        );
        if (confirm) {
          setStateIds.push({
            id: id != null ? id : ID,
            confirm,
            returnText: confirmText,
            userToSend
          });
          return setStateIds;
        }
      }
      if (!returnText.includes("{'id':'")) {
        setStateIds.push({
          id: ID,
          confirm,
          returnText,
          userToSend,
          parse_mode
        });
      } else {
        returnText = returnText.replace(/'/g, '"');
        const textToSend = returnText.slice(0, returnText.indexOf("{")).trim();
        const { json, isValidJson } = (0, import_string.parseJSON)(
          returnText.slice(returnText.indexOf("{"), returnText.indexOf("}") + 1)
        );
        if (!isValidJson) {
          return;
        }
        json.text = json.text + returnText.slice(returnText.indexOf("}") + 1);
        if (textToSend && textToSend !== "") {
          await (0, import_telegram.sendToTelegram)({
            userToSend,
            textToSend,
            telegramInstance,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID,
            parse_mode
          });
        }
        setStateIds.push({
          id: json.id,
          confirm: true,
          returnText: json.text,
          userToSend
        });
      }
      if (toggle) {
        import_main.adapter.getForeignStateAsync(ID).then((val) => {
          if (val) {
            import_main.adapter.setForeignStateAsync(ID, !val.val, ack).catch((e) => {
              (0, import_logging.errorLogger)("Error setForeignStateAsync:", e, import_main.adapter);
            });
          }
        }).catch((e) => {
          (0, import_logging.errorLogger)("Error getForeignStateAsync:", e, import_main.adapter);
        });
      } else {
        await setValue(ID, value, SubmenuValuePriority, valueFromSubmenu, (0, import_utils.isTruthy)(ack));
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
