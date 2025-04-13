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
  checkStatusInfo: () => checkStatusInfo,
  checkTypeOfId: () => checkTypeOfId,
  processTimeIdLc: () => processTimeIdLc
});
module.exports = __toCommonJS(utilities_exports);
var import_utils = require("./utils");
var import_string = require("./string");
var import_logging = require("../app/logging");
var import_time = require("./time");
var import_main = require("../main");
var import_config = require("../config/config");
var import_appUtils = require("./appUtils");
const processTimeIdLc = async (textToSend, id) => {
  const { substring } = (0, import_string.decomposeText)(textToSend, import_config.config.timestamp.start, import_config.config.timestamp.end);
  const array = substring.split(",");
  let changedSubstring = substring;
  changedSubstring = changedSubstring.replace(array[0], "");
  const key = (0, import_appUtils.getTypeofTimestamp)(array[0]);
  let idFromText = "";
  if (!id) {
    if (!changedSubstring.includes("id:")) {
      import_main.adapter.log.debug(`Error processTimeIdLc: id not found in: ${changedSubstring}`);
      return;
    }
    if (array[2]) {
      idFromText = array[2].replace("id:", "").replace("}", "").replace(/'/g, "");
      changedSubstring = changedSubstring.replace(array[2], "").replace(/,/g, "");
    }
  }
  if (!id && !idFromText) {
    return;
  }
  const value = await import_main.adapter.getForeignStateAsync(id || idFromText);
  let unixTs;
  let timeStringUser;
  if (key && value) {
    timeStringUser = changedSubstring.replace(",(", "").replace(")", "").replace("}", "");
    unixTs = value[key];
  }
  if (!unixTs) {
    return;
  }
  const timeWithPad = (0, import_time.getTimeWithPad)((0, import_time.extractTimeValues)(unixTs));
  const timeStringReplaced = (0, import_appUtils.timeStringReplacer)(timeWithPad, timeStringUser);
  return timeStringReplaced != null ? timeStringReplaced : textToSend;
};
const checkStatus = async (text, processTimeValue) => {
  try {
    const substring = (0, import_string.decomposeText)(text, "{status:", "}").substring;
    let id, valueChange;
    import_main.adapter.log.debug(`Substring ${substring}`);
    if (substring.includes("status:'id':")) {
      id = substring.split(":")[2].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
      valueChange = substring.split(":")[3] ? substring.split(":")[3].replace("}", "") !== "false" : true;
    } else {
      id = substring.split(":")[1].replace("'}", "").replace(/'/g, "").replace(/}/g, "");
      valueChange = substring.split(":")[2] ? substring.split(":")[2].replace("}", "") !== "false" : true;
    }
    const stateValue = await import_main.adapter.getForeignStateAsync(id);
    if (!stateValue) {
      import_main.adapter.log.debug(`State not found: ${id}`);
      return "";
    }
    if (text.includes("{time}") && processTimeValue) {
      text = text.replace(substring, "");
      const val2 = String(stateValue.val);
      return processTimeValue(text, val2).replace(val2, "");
    }
    if (!(0, import_utils.isDefined)(stateValue.val)) {
      import_main.adapter.log.debug(`State Value is undefined: ${id}`);
      return text.replace(substring, "");
    }
    if (!valueChange) {
      return text.replace(substring, stateValue.val.toString());
    }
    const { newValue: val, textToSend, error } = (0, import_string.getValueToExchange)(import_main.adapter, text, stateValue.val);
    let newValue;
    if (!error) {
      text = textToSend;
      newValue = val;
    } else {
      newValue = stateValue.val;
    }
    import_main.adapter.log.debug(`CheckStatus Text: ${text} Substring: ${substring}`);
    import_main.adapter.log.debug(`CheckStatus Return Value: ${text.replace(substring, newValue.toString())}`);
    return text.replace(substring, newValue.toString());
  } catch (e) {
    import_main.adapter.log.error(`Error checkStatus:${e.message}`);
    import_main.adapter.log.error(`Stack:${e.stack}`);
    return "";
  }
};
const checkStatusInfo = async (text) => {
  try {
    if (!text) {
      return "";
    }
    import_main.adapter.log.debug(`Text: ${text}`);
    if (text.includes("{status:")) {
      while (text.includes("{status:")) {
        text = await checkStatus(text, import_time.integrateTimeIntoText);
      }
    }
    if (text.includes("{time.lc") || text.includes("{time.ts")) {
      text = await processTimeIdLc(text, null) || "";
    }
    if (text.includes("{set:")) {
      const result = (0, import_string.decomposeText)(text, "{set:", "}");
      const id = result.substring.split(",")[0].replace("{set:'id':", "").replace(/'/g, "");
      const importedValue = result.substring.split(",")[1];
      text = result.textExcludeSubstring;
      const convertedValue = await checkTypeOfId(id, importedValue);
      const ack = result.substring.split(",")[2].replace("}", "") == "true";
      if (text === "") {
        text = "W\xE4hle eine Aktion";
      }
      if (convertedValue) {
        await import_main.adapter.setForeignStateAsync(id, convertedValue, ack);
      }
    }
    if (text) {
      import_main.adapter.log.debug(`CheckStatusInfo: ${text}`);
      return text;
    }
    return "";
  } catch (e) {
    (0, import_logging.errorLogger)("Error checkStatusInfo:", e, import_main.adapter);
    return "";
  }
};
async function checkTypeOfId(id, value) {
  try {
    import_main.adapter.log.debug(`Check Type of Id: ${id}`);
    const obj = await import_main.adapter.getForeignObjectAsync(id);
    const receivedType = typeof value;
    if (!obj || !value) {
      return value;
    }
    if (receivedType === obj.common.type || !obj.common.type) {
      return value;
    }
    import_main.adapter.log.debug(`Change Value type from  "${receivedType}" to "${obj.common.type}"`);
    if (obj.common.type === "boolean") {
      if (value == "true") {
        value = true;
      }
      if (value == "false") {
        value = false;
      }
      return value;
    }
    if (obj.common.type === "string") {
      return JSON.stringify(value);
    }
    if (obj && obj.common && obj.common.type === "number" && typeof value === "string") {
      return parseFloat(value);
    }
    return value;
  } catch (e) {
    (0, import_logging.errorLogger)("Error checkTypeOfId:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkStatusInfo,
  checkTypeOfId,
  processTimeIdLc
});
//# sourceMappingURL=utilities.js.map
