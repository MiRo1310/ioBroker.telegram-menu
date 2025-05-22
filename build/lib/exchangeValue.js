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
var exchangeValue_exports = {};
__export(exchangeValue_exports, {
  exchangePlaceholderWithValue: () => exchangePlaceholderWithValue,
  exchangeValue: () => exchangeValue,
  getPlaceholderValue: () => getPlaceholderValue
});
module.exports = __toCommonJS(exchangeValue_exports);
var import_config = require("../config/config");
var import_string = require("./string");
function isNoValueParameter(textToSend) {
  let insertValue = true;
  if (textToSend.includes("{novalue}")) {
    textToSend.replace("{novalue}", "");
    insertValue = false;
  }
  return { insertValue, textToSend };
}
const exchangeValue = (adapter, textToSend, val) => {
  var _a;
  const result = isNoValueParameter(textToSend);
  textToSend = result.textToSend;
  if (textToSend.includes(import_config.config.change.start)) {
    const { start, end, command } = import_config.config.change;
    const { substring, textExcludeSubstring } = (0, import_string.decomposeText)(textToSend, start, end);
    const stringExcludedChange = (0, import_string.replaceAll)(substring, "'", '"').replace(command, "");
    const { json, isValidJson } = (0, import_string.parseJSON)(stringExcludedChange);
    if (isValidJson) {
      const newValue = (_a = json[String(val)]) != null ? _a : val;
      return {
        newValue,
        textToSend: exchangePlaceholderWithValue(textExcludeSubstring, result.insertValue ? newValue : ""),
        error: false
      };
    }
    adapter.log.error(`There is a error in your input: ${stringExcludedChange}`);
    return { newValue: val != null ? val : "", textToSend, error: true };
  }
  return {
    textToSend: exchangePlaceholderWithValue(textToSend, result.insertValue ? val != null ? val : "" : ""),
    newValue: val != null ? val : "",
    error: false
  };
};
function exchangePlaceholderWithValue(textToSend, val) {
  const searchString = getPlaceholderValue(textToSend);
  return searchString !== "" ? textToSend.replace(searchString, val.toString()).trim() : `${textToSend} ${val}`.trim();
}
function getPlaceholderValue(textToSend) {
  if (textToSend.includes("&&")) {
    return "&&";
  }
  if (textToSend.includes("&amp;&amp;")) {
    return "&amp;&amp;";
  }
  return "";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  exchangePlaceholderWithValue,
  exchangeValue,
  getPlaceholderValue
});
//# sourceMappingURL=exchangeValue.js.map
