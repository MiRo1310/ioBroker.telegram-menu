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
var import_config = require("@b/config/config");
var import_string = require("@b/lib/string");
var import_utilities = require("@b/lib/utilities");
var import_utils = require("@b/lib/utils");
var import_logging = require("@b/app/logging");
var import_dynamicValue = require("@b/app/dynamicValue");
var import_setStateIdsToListenTo = require("@b/app/setStateIdsToListenTo");
var import_exchangeValue = require("@b/lib/exchangeValue");
var import_telegram = require("@b/app/telegram");
const modifiedValue = (valueFromSubmenu, value) => {
  return value.includes(import_config.config.modifiedValue) ? value.replace(import_config.config.modifiedValue, valueFromSubmenu) : valueFromSubmenu;
};
const isDynamicValueToSet = async (adapter, value) => {
  if (typeof value === "string" && value.includes(import_config.config.dynamicValue.start)) {
    const { substring, substringExcludeSearch: id } = (0, import_string.decomposeText)(
      value,
      import_config.config.dynamicValue.start,
      import_config.config.dynamicValue.end
    );
    const newValue = await adapter.getForeignStateAsync(id);
    return value.replace(substring, String(newValue == null ? void 0 : newValue.val));
  }
  return value;
};
const setstateIobroker = async ({
  id,
  value,
  ack,
  adapter
}) => {
  try {
    const val = await (0, import_utilities.transformValueToTypeOfId)(adapter, id, value);
    adapter.log.debug(`Value to Set: ${(0, import_string.jsonString)(val)}`);
    if ((0, import_utils.isDefined)(val)) {
      await adapter.setForeignStateAsync(id, val, ack);
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error Setstate", error, adapter);
  }
};
const setValue = async (adapter, id, value, valueFromSubmenu, ack) => {
  try {
    const valueToSet = (0, import_utils.isDefined)(value) && (0, import_string.isNonEmptyString)(value) ? await isDynamicValueToSet(adapter, value) : modifiedValue(String(valueFromSubmenu), value);
    await setstateIobroker({ adapter, id, value: valueToSet, ack });
  } catch (error) {
    (0, import_logging.errorLogger)("Error setValue", error, adapter);
  }
};
const handleSetState = async (instance, part, userToSend, valueFromSubmenu, telegramParams) => {
  const adapter = telegramParams.adapter;
  try {
    if (!part.switch) {
      return;
    }
    for (const { returnText: text, id: ID, parse_mode, confirm, ack, toggle, value } of part.switch) {
      let returnText = text;
      if (returnText.includes(import_config.config.setDynamicValue)) {
        const { confirmText, id } = await (0, import_dynamicValue.setDynamicValue)(
          instance,
          returnText,
          ack,
          ID,
          userToSend,
          telegramParams,
          parse_mode,
          confirm
        );
        if (confirm) {
          await (0, import_setStateIdsToListenTo.addSetStateIds)(adapter, {
            id: id != null ? id : ID,
            confirm,
            returnText: confirmText,
            userToSend
          });
        }
        return;
      }
      if (!returnText.includes("{'id':'")) {
        await (0, import_setStateIdsToListenTo.addSetStateIds)(adapter, {
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
        if (json.id) {
          const state = await adapter.getForeignStateAsync(json.id);
          const val = state ? String(state == null ? void 0 : state.val) : "";
          returnText = returnText.replace(substring, `${json.text} ${val}`);
        }
        await (0, import_setStateIdsToListenTo.addSetStateIds)(adapter, {
          id: json.id,
          confirm: true,
          returnText: json.text,
          userToSend
        });
      }
      let valueToTelegram = valueFromSubmenu != null ? valueFromSubmenu : value;
      if (toggle) {
        const state = await adapter.getForeignStateAsync(ID);
        const val = state ? !state.val : false;
        await setstateIobroker({ adapter, id: ID, value: val, ack });
        valueToTelegram = val;
      } else {
        await setValue(adapter, ID, value, valueFromSubmenu, ack);
      }
      const { textToSend } = (0, import_exchangeValue.exchangeValue)(adapter, returnText, valueToTelegram);
      await (0, import_telegram.sendToTelegram)({
        instance,
        userToSend,
        textToSend,
        telegramParams,
        parse_mode
      });
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error Switch", error, adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleSetState,
  setstateIobroker
});
//# sourceMappingURL=setstate.js.map
