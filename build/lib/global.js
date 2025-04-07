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
  checkDirectoryIsOk: () => checkDirectoryIsOk,
  decomposeText: () => decomposeText,
  deepCopy: () => deepCopy,
  deleteDoubleEntriesInArray: () => deleteDoubleEntriesInArray,
  isDefined: () => isDefined,
  isFalsy: () => isFalsy,
  isJSON: () => isJSON,
  isString: () => isString,
  isTruthy: () => isTruthy,
  replaceAll: () => replaceAll
});
module.exports = __toCommonJS(global_exports);
var import_logging = require("./logging");
const isDefined = (value) => value !== void 0 && value !== null;
const deleteDoubleEntriesInArray = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);
const replaceAll = (text, searchValue, replaceValue) => text.replace(new RegExp(searchValue, "g"), replaceValue);
function isJSON(_string) {
  try {
    JSON.parse(_string);
    return true;
  } catch (error2) {
    console.error([{ text: "Error:", val: error2 }]);
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
    if (!obj) {
      return void 0;
    }
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    console.error(`Error deepCopy: ${JSON.stringify(err)}`);
  }
};
const isString = (value) => typeof value === "string";
const isTruthy = (value) => ["1", 1, true, "true"].includes(value);
const isFalsy = (value) => ["0", 0, false, "false", void 0, null].includes(value);
function checkDirectoryIsOk(directory) {
  if (["", null, void 0].includes(directory)) {
    (0, import_logging.error)([
      {
        text: "Error:",
        val: "No directory to save the picture. Please add a directory in the settings with full read and write permissions."
      }
    ]);
    return false;
  }
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkDirectoryIsOk,
  decomposeText,
  deepCopy,
  deleteDoubleEntriesInArray,
  isDefined,
  isFalsy,
  isJSON,
  isString,
  isTruthy,
  replaceAll
});
//# sourceMappingURL=global.js.map
