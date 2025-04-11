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
  jsonString: () => jsonString,
  parseJSON: () => parseJSON,
  replaceAll: () => replaceAll,
  validateNewLine: () => validateNewLine
});
module.exports = __toCommonJS(string_exports);
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
  return text.replace(new RegExp(escapedSearchValue, "g"), replaceValue).trim();
};
const validateNewLine = (text) => {
  return text.replace(/^['"]|['"]$/g, "").replace(/\\n/g, "\n").replace(/ \\\n/g, "\n").replace(/\\(?!n)/g, "");
};
function decomposeText(text, searchValue, secondValue) {
  const startindex = text.indexOf(searchValue);
  const endindex = text.indexOf(secondValue, startindex);
  const substring = text.substring(startindex, endindex + secondValue.length);
  const textWithoutSubstring = text.replace(substring, "").trim();
  return {
    startindex,
    endindex,
    substring,
    textWithoutSubstring
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  decomposeText,
  jsonString,
  parseJSON,
  replaceAll,
  validateNewLine
});
//# sourceMappingURL=string.js.map
