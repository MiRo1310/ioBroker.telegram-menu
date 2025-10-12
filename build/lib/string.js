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
  cleanUpString: () => cleanUpString,
  decomposeText: () => decomposeText,
  getNewline: () => getNewline,
  isBooleanString: () => isBooleanString,
  isEmptyString: () => isEmptyString,
  isNonEmptyString: () => isNonEmptyString,
  isString: () => isString,
  jsonString: () => jsonString,
  pad: () => pad,
  parseJSON: () => parseJSON,
  removeMultiSpaces: () => removeMultiSpaces,
  removeQuotes: () => removeQuotes,
  replaceAll: () => replaceAll,
  replaceAllItems: () => replaceAllItems,
  stringReplacer: () => stringReplacer
});
module.exports = __toCommonJS(string_exports);
var import_logging = require("@b/app/logging");
var import_string = require("@/lib/string");
const jsonString = (val) => JSON.stringify(val);
function parseJSON(val, adapter) {
  try {
    return { json: JSON.parse(val), isValidJson: true };
  } catch (e) {
    if (adapter) {
      (0, import_logging.errorLogger)("Error parseJSON:", e, adapter);
    }
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
const removeQuotes = (text) => text.replace(/['"]/g, "");
const removeMultiSpaces = (text) => text.replace(/ {2,}/g, " ");
const cleanUpString = (text) => {
  if (!text) {
    return "";
  }
  return removeMultiSpaces(
    text.replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n").replace(/ \\\n/g, "\n").replace(/\\(?!n)/g, "").replace(/\n /g, "\n")
    // Entferne Leerzeichen vor Zeilenumbrüchen
  );
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
function getNewline(newline) {
  return (0, import_string.isTruthy)(newline) ? "\n" : "";
}
function isBooleanString(str) {
  return str === "true" || str === "false";
}
const isNonEmptyString = (str) => str.trim() !== "";
const isEmptyString = (str) => str.trim() === "";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cleanUpString,
  decomposeText,
  getNewline,
  isBooleanString,
  isEmptyString,
  isNonEmptyString,
  isString,
  jsonString,
  pad,
  parseJSON,
  removeMultiSpaces,
  removeQuotes,
  replaceAll,
  replaceAllItems,
  stringReplacer
});
//# sourceMappingURL=string.js.map
