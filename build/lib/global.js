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
var global_exports = {};
__export(global_exports, {
  decomposeText: () => decomposeText,
  deepCopy: () => deepCopy,
  deleteDoubleEntriesInArray: () => deleteDoubleEntriesInArray,
  isJSON: () => isJSON,
  isString: () => isString,
  replaceAll: () => replaceAll
});
module.exports = __toCommonJS(global_exports);
function deleteDoubleEntriesInArray(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
function replaceAll(text, searchValue, replaceValue) {
  return text.replace(new RegExp(searchValue, "g"), replaceValue);
}
function isJSON(_string) {
  try {
    JSON.parse(_string);
    return true;
  } catch (error) {
    console.error([{ text: "Error:", val: error }]);
    return false;
  }
}
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
const deepCopy = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    console.error(`Error deepCopy: ${JSON.stringify(err)}`);
  }
};
function isString(value) {
  return typeof value === "string";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  decomposeText,
  deepCopy,
  deleteDoubleEntriesInArray,
  isJSON,
  isString,
  replaceAll
});
//# sourceMappingURL=global.js.map
