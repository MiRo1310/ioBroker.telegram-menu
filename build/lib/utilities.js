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
  checkStatus: () => checkStatus,
  checkStatusInfo: () => checkStatusInfo,
  processTimeIdLc: () => processTimeIdLc,
  transformValueToTypeOfId: () => transformValueToTypeOfId
});
module.exports = __toCommonJS(utilities_exports);
var import_utils = require("./utils");
var import_string = require("./string");
var import_logging = require("../app/logging");
var import_time = require("./time");
var import_main = require("../main");
var import_config = require("../config/config");
var import_appUtils = require("./appUtils");
var import_setstate = require("../app/setstate");
var import_splitValues = require("./splitValues");
const processTimeIdLc = async (textToSend, id) => {
  const { substring, substringExcludeSearch } = (0, import_string.decomposeText)(
    textToSend,
    import_config.config.timestamp.start,
    import_config.config.timestamp.end
  );
  const { typeofTimestamp, timeString, idString } = (0, import_splitValues.getProcessTimeValues)(substringExcludeSearch);
  if (!id && (!idString || idString.length < 5)) {
    return textToSend.replace(substring, "Invalid ID");
  }
  const value = await import_main.adapter.getForeignStateAsync(id != null ? id : idString);
  if (!value) {
    return textToSend.replace(substring, "Invalid ID");
  }
  const timeStringUser = (0, import_string.replaceAllItems)(timeString, [",(", ")", "}"]);
  const unixTs = value[typeofTimestamp];
  const timeWithPad = (0, import_time.getTimeWithPad)((0, import_time.extractTimeValues)(unixTs));
  const timeStringReplaced = (0, import_appUtils.timeStringReplacer)(timeWithPad, timeStringUser);
  return timeStringReplaced != null ? timeStringReplaced : textToSend;
};
const checkStatus = async (text) => {
  const { substring, substringExcludeSearch, textExcludeSubstring } = (0, import_string.decomposeText)(
    text,
    import_config.config.status.start,
    import_config.config.status.end
  );
  const { id, shouldChange } = (0, import_appUtils.statusIdAndParams)(substringExcludeSearch);
  const stateValue = await import_main.adapter.getForeignStateAsync(id);
  if (!(0, import_utils.isDefined)(stateValue == null ? void 0 : stateValue.val)) {
    import_main.adapter.log.debug(`State not found: ${id}`);
    return text.replace(substring, "");
  }
  const stateValueString = String(stateValue.val);
  if (text.includes(import_config.config.time)) {
    return (0, import_time.integrateTimeIntoText)(textExcludeSubstring, stateValueString).replace(stateValueString, "");
  }
  if (!shouldChange) {
    return text.replace(substring, stateValueString);
  }
  const { newValue: val, textToSend, error } = (0, import_string.getValueToExchange)(import_main.adapter, text, stateValue.val);
  return (!error ? textToSend : text).replace(substring, !error ? val.toString() : stateValueString);
};
const checkStatusInfo = async (text) => {
  if (!text) {
    return "";
  }
  try {
    import_main.adapter.log.debug(`Check status Info: ${text}`);
    if (text.includes(import_config.config.status.start)) {
      while (text.includes(import_config.config.status.start)) {
        text = await checkStatus(text);
      }
    }
    if (text.includes(import_config.config.timestamp.lc) || text.includes(import_config.config.timestamp.ts)) {
      text = await processTimeIdLc(text);
    }
    if (text.includes(import_config.config.set.start)) {
      const { substring, textExcludeSubstring } = (0, import_string.decomposeText)(text, import_config.config.set.start, import_config.config.set.end);
      const id = substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
      const importedValue = substring.split(",")[1];
      text = textExcludeSubstring;
      const convertedValue = await transformValueToTypeOfId(id, importedValue);
      const ack = substring.split(",")[2].replace("}", "") == "true";
      if ((0, import_string.isEmptyString)(text)) {
        text = "W\xE4hle eine Aktion";
      }
      if (convertedValue) {
        await (0, import_setstate.setstateIobroker)({ id, value: convertedValue, ack });
      }
    }
    import_main.adapter.log.debug(`CheckStatusInfo: ${text}`);
    return text;
  } catch (e) {
    (0, import_logging.errorLogger)("Error checkStatusInfo:", e, import_main.adapter);
    return "";
  }
};
async function transformValueToTypeOfId(id, value) {
  try {
    const receivedType = typeof value;
    const obj = await import_main.adapter.getForeignObjectAsync(id);
    if (!obj || !(0, import_utils.isDefined)(value) || (0, import_appUtils.isNoTypeDefined)(receivedType, obj)) {
      return value;
    }
    import_main.adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);
    switch (obj.common.type) {
      case "string":
        return String(value);
      case "number":
        return typeof value === "string" ? parseFloat(value) : parseFloat((0, import_string.jsonString)(value));
      case "boolean":
        return (0, import_utils.isTruthy)(value);
      default:
        return value;
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error checkTypeOfId:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkStatus,
  checkStatusInfo,
  processTimeIdLc,
  transformValueToTypeOfId
});
//# sourceMappingURL=utilities.js.map
