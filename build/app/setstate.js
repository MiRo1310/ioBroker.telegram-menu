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
  handleSetState: () => handleSetState,
  setstateIobroker: () => setstateIobroker
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
var import_setStateIdsToListenTo = require("./setStateIdsToListenTo");
var import_exchangeValue = require("../lib/exchangeValue");
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
    return value.replace(substring, String(newValue == null ? void 0 : newValue.val));
  }
  return value;
};
const setstateIobroker = async ({
  id,
  value,
  ack
}) => {
  try {
    const val = await (0, import_utilities.transformValueToTypeOfId)(id, value);
    import_main.adapter.log.debug(`Value to Set: ${(0, import_string.jsonString)(val)}`);
    if ((0, import_utils.isDefined)(val)) {
      await import_main.adapter.setForeignStateAsync(id, val, ack);
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error Setstate", error, import_main.adapter);
  }
};
const setValue = async (id, value, valueFromSubmenu, ack) => {
  try {
    const valueToSet = (0, import_utils.isDefined)(value) && (0, import_string.isNonEmptyString)(value) ? await isDynamicValueToSet(value) : modifiedValue(String(valueFromSubmenu), value);
    await setstateIobroker({ id, value: valueToSet, ack });
  } catch (error) {
    (0, import_logging.errorLogger)("Error setValue", error, import_main.adapter);
  }
};
const handleSetState = async (part, userToSend, valueFromSubmenu, telegramParams) => {
  try {
    if (!part.switch) {
      return;
    }
    for (const { returnText: text, id: ID, parse_mode, confirm, ack, toggle, value } of part.switch) {
      let returnText = text;
      if (returnText.includes(import_config.config.setDynamicValue)) {
        const { confirmText, id } = await (0, import_dynamicValue.setDynamicValue)(
          returnText,
          ack,
          ID,
          userToSend,
          telegramParams,
          parse_mode,
          confirm
        );
        if (confirm) {
          await (0, import_setStateIdsToListenTo.addSetStateIds)({
            id: id != null ? id : ID,
            confirm,
            returnText: confirmText,
            userToSend
          });
        }
        return;
      }
      if (!returnText.includes("{'id':'")) {
        await (0, import_setStateIdsToListenTo.addSetStateIds)({
          id: ID,
          confirm,
          returnText,
          userToSend,
          parse_mode
        });
      } else {
        returnText = returnText.replace(/'/g, '"');
        const { substring } = (0, import_string.decomposeText)(returnText, '{"id":', "}");
        const { json, isValidJson } = (0, import_string.parseJSON)(substring);
        if (!isValidJson) {
          return;
        }
        const text2 = returnText.replace(substring, json.text);
        let value2 = null;
        if (json.id) {
          const state = await import_main.adapter.getForeignStateAsync(json.id);
          value2 = state ? state.val : null;
        }
        const { textToSend } = (0, import_exchangeValue.exchangeValue)(import_main.adapter, text2, valueFromSubmenu != null ? valueFromSubmenu : value2);
        await (0, import_telegram.sendToTelegram)({
          userToSend,
          textToSend,
          telegramParams,
          parse_mode
        });
        await (0, import_setStateIdsToListenTo.addSetStateIds)({
          id: json.id,
          confirm: true,
          returnText: json.text,
          userToSend
        });
      }
      if (toggle) {
        const state = await import_main.adapter.getForeignStateAsync(ID);
        state ? await setstateIobroker({ id: ID, value: !state.val, ack }) : await setstateIobroker({ id: ID, value: false, ack });
      } else {
        await setValue(ID, value, valueFromSubmenu, ack);
      }
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error Switch", error, import_main.adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleSetState,
  setstateIobroker
});
//# sourceMappingURL=setstate.js.map
