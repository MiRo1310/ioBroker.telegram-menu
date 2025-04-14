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
var string_exports = {};
__export(string_exports, {
  decomposeText: () => decomposeText,
  getValueToExchange: () => getValueToExchange,
  isString: () => isString,
  jsonString: () => jsonString,
  pad: () => pad,
  parseJSON: () => parseJSON,
  removeQuotes: () => removeQuotes,
  replaceAll: () => replaceAll,
  replaceAllItems: () => replaceAllItems,
  stringReplacer: () => stringReplacer,
  validateNewLine: () => validateNewLine
});
module.exports = __toCommonJS(string_exports);
var import_config = require("../config/config");
const jsonString = (val) => JSON.stringify(val);
function parseJSON(val) {
  try {
    const parsed = JSON.parse(val);
    return { json: parsed, isValidJson: true };
  } catch (e) {
    return { json: val, isValidJson: false };
  }
}
const replaceAll = (text, searchValue, replaceValue) => {
  const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escapedSearchValue, "g"), replaceValue);
};
const replaceAllItems = (text, searched) => {
  searched.forEach((item) => {
    if (typeof item === "string") {
      text = replaceAll(text, item, "");
    } else {
      text = replaceAll(text, item.search, item.val);
    }
  });
  return text;
};
const removeQuotes = (text) => {
  return text.replace(/['"]/g, "");
};
const validateNewLine = (text) => {
  if (!text) {
    return "";
  }
  return text.replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n").replace(/ \\\n/g, "\n").replace(/\\(?!n)/g, "");
};
function decomposeText(text, firstSearch, secondSearch) {
  const startindex = text.indexOf(firstSearch);
  const endindex = text.indexOf(secondSearch, startindex);
  const substring = text.substring(startindex, endindex + secondSearch.length);
  const substringExcludedSearch = stringReplacer(substring, [firstSearch, secondSearch]);
  const textWithoutSubstring = text.replace(substring, "").trim();
  return {
    startindex,
    endindex,
    substring,
    textExcludeSubstring: textWithoutSubstring,
    substringExcludeSearch: substringExcludedSearch
  };
}
const getValueToExchange = (adapter, textToSend, val) => {
  var _a;
  if (textToSend.includes(import_config.config.change.start)) {
    const { start, end, command } = import_config.config.change;
    const { startindex, endindex, substring } = decomposeText(textToSend, start, end);
    const modifiedString = replaceAll(substring, "'", '"').replace(command, "");
    const { json, isValidJson } = parseJSON(modifiedString);
    if (isValidJson) {
      return {
        newValue: (_a = json[String(val)]) != null ? _a : val,
        textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1),
        error: false
      };
    }
    adapter.log.error(`There is a error in your input: ${modifiedString}`);
    return { newValue: val, textToSend, error: true };
  }
  return { textToSend, newValue: val, error: false };
};
const isString = (value) => typeof value === "string";
function stringReplacer(substring, valueToReplace) {
  if (typeof valueToReplace[0] === "string") {
    valueToReplace.forEach((item) => {
      substring = substring.replace(item, "");
    });
    return substring;
  }
  valueToReplace.forEach(({ val, newValue }) => {
    substring = substring.replace(val, newValue);
  });
  return substring;
}
const pad = (value, length = 2) => {
  if (value < 0) {
    return `-${(value * -1).toString().padStart(length - 1, "0")}`;
  }
  return value.toString().padStart(length, "0");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  decomposeText,
  getValueToExchange,
  isString,
  jsonString,
  pad,
  parseJSON,
  removeQuotes,
  replaceAll,
  replaceAllItems,
  stringReplacer,
  validateNewLine
});
//# sourceMappingURL=string.js.map
