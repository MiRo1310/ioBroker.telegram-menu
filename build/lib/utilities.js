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
  processTimeIdLc: () => processTimeIdLc,
  textModifier: () => textModifier,
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
var import_status = require("../app/status");
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
  const formattedTimeParams = (0, import_string.replaceAllItems)(timeString, [",(", "(", ")", "}"]);
  const unixTs = value[typeofTimestamp];
  const timeWithPad = (0, import_time.getTimeWithPad)((0, import_time.extractTimeValues)(unixTs));
  const formattedTime = (0, import_appUtils.timeStringReplacer)(timeWithPad, formattedTimeParams);
  return formattedTime ? textToSend.replace(substring, formattedTime) : textToSend;
};
const textModifier = async (text) => {
  if (!text) {
    return "";
  }
  try {
    const inputText = text;
    while (text.includes(import_config.config.status.start)) {
      text = await (0, import_status.checkStatus)(import_main.adapter, text);
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
    text === inputText ? import_main.adapter.log.debug(`Return text : ${text} `) : import_main.adapter.log.debug(`Return text was modified from "${inputText}" to "${text}" `);
    return text;
  } catch (e) {
    (0, import_logging.errorLogger)("Error returnTextModifier:", e, import_main.adapter);
    return "";
  }
};
async function transformValueToTypeOfId(id, value) {
  try {
    const receivedType = typeof value;
    const obj = await import_main.adapter.getForeignObjectAsync(id);
    if (!obj || !(0, import_utils.isDefined)(value) || (0, import_appUtils.isSameType)(receivedType, obj)) {
      return value;
    }
    import_main.adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);
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
    (0, import_logging.errorLogger)("Error checkTypeOfId:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  processTimeIdLc,
  textModifier,
  transformValueToTypeOfId
});
//# sourceMappingURL=utilities.js.map
