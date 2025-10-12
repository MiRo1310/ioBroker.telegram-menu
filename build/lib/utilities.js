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
var utilities_exports = {};
__export(utilities_exports, {
  setTimeValue: () => setTimeValue,
  textModifier: () => textModifier,
  transformValueToTypeOfId: () => transformValueToTypeOfId
});
module.exports = __toCommonJS(utilities_exports);
var import_utils = require("@b/lib/utils");
var import_status = require("../app/status");
var import_splitValues = require("@b/lib/splitValues");
var import_string = require("@b/lib/string");
var import_config = require("@b/config/config");
var import_appUtils = require("@b/lib/appUtils");
var import_time = require("@b/lib/time");
var import_setstate = require("@b/app/setstate");
var import_logging = require("@b/app/logging");
const setTimeValue = async (adapter, textToSend, id) => {
  const { substring, substringExcludeSearch } = (0, import_string.decomposeText)(
    textToSend,
    import_config.config.timestamp.start,
    import_config.config.timestamp.end
  );
  const { typeofTimestamp, timeString, idString } = (0, import_splitValues.getProcessTimeValues)(substringExcludeSearch);
  if (!id && (!idString || idString.length < 5)) {
    return textToSend.replace(substring, import_config.invalidId);
  }
  const value = await adapter.getForeignStateAsync(id != null ? id : idString);
  if (!value) {
    return textToSend.replace(substring, import_config.invalidId);
  }
  const formattedTimeParams = (0, import_string.replaceAllItems)(timeString, [",(", "(", ")", "}"]);
  const unixTs = value[typeofTimestamp];
  const timeWithPad = (0, import_time.getTimeWithPad)((0, import_time.extractTimeValues)(unixTs));
  const formattedTime = (0, import_appUtils.timeStringReplacer)(timeWithPad, formattedTimeParams);
  return formattedTime ? textToSend.replace(substring, formattedTime) : textToSend;
};
const textModifier = async (adapter, text) => {
  if (!text) {
    return "";
  }
  try {
    const inputText = text;
    while (text.includes(import_config.config.status.start)) {
      text = await (0, import_status.checkStatus)(adapter, text);
    }
    if (text.includes(import_config.config.timestamp.lc) || text.includes(import_config.config.timestamp.ts)) {
      text = await setTimeValue(adapter, text);
    }
    if (text.includes(import_config.config.set.start)) {
      const { substring, textExcludeSubstring } = (0, import_string.decomposeText)(text, import_config.config.set.start, import_config.config.set.end);
      const id = substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
      const importedValue = substring.split(",")[1];
      text = textExcludeSubstring;
      const convertedValue = await transformValueToTypeOfId(adapter, id, importedValue);
      const ack = substring.split(",")[2].replace("}", "") == "true";
      if ((0, import_string.isEmptyString)(text)) {
        text = "W\xE4hle eine Aktion";
      }
      if (convertedValue) {
        await (0, import_setstate.setstateIobroker)({ adapter, id, value: convertedValue, ack });
      }
    }
    text === inputText ? adapter.log.debug(`Return text : ${text} `) : adapter.log.debug(`Return text was modified from "${inputText}" to "${text}" `);
    return text;
  } catch (e) {
    (0, import_logging.errorLogger)("Error returnTextModifier:", e, adapter);
    return "";
  }
};
async function transformValueToTypeOfId(adapter, id, value) {
  try {
    const receivedType = typeof value;
    const obj = await adapter.getForeignObjectAsync(id);
    if (!obj || !(0, import_utils.isDefined)(value) || (0, import_appUtils.isSameType)(receivedType, obj)) {
      return value;
    }
    adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);
    switch (obj.common.type) {
      case "string":
        return String(value);
      case "number":
        return typeof value === "string" ? parseFloat(value) : parseFloat((0, import_string.jsonString)(value));
      case "boolean":
        return (0, import_utils.isDefined)(value) && !["false", false, 0, "0", "null", "undefined"].includes(value);
      default:
        return value;
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error checkTypeOfId:", e, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setTimeValue,
  textModifier,
  transformValueToTypeOfId
});
//# sourceMappingURL=utilities.js.map
