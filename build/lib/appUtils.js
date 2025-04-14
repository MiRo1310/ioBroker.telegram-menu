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
var appUtils_exports = {};
__export(appUtils_exports, {
  calcValue: () => calcValue,
  checkOneLineValue: () => checkOneLineValue,
  getListOfMenusIncludingUser: () => getListOfMenusIncludingUser,
  getParseMode: () => getParseMode,
  getTypeofTimestamp: () => getTypeofTimestamp,
  isStartside: () => isStartside,
  roundValue: () => roundValue,
  statusIdAndParams: () => statusIdAndParams,
  timeStringReplacer: () => timeStringReplacer
});
module.exports = __toCommonJS(appUtils_exports);
var import_config = require("../config/config");
var import_string = require("./string");
var import_math = require("./math");
var import_utils = require("./utils");
const checkOneLineValue = (text) => !text.includes(import_config.config.rowSplitter) ? `${text} ${import_config.config.rowSplitter}` : text;
function calcValue(textToSend, val, adapter) {
  const { substringExcludeSearch, textExcludeSubstring } = (0, import_string.decomposeText)(
    textToSend,
    import_config.config.math.start,
    import_config.config.math.end
  );
  const { val: evalVal, error } = (0, import_math.evaluate)([val, substringExcludeSearch], adapter);
  return error ? { textToSend: textExcludeSubstring, val, error } : { textToSend: textExcludeSubstring, val: evalVal, error };
}
function roundValue(val, textToSend) {
  const floatVal = parseFloat(val);
  const { textExcludeSubstring, substringExcludeSearch: decimalPlaces } = (0, import_string.decomposeText)(
    textToSend,
    import_config.config.round.start,
    import_config.config.round.end
  );
  const decimalPlacesNum = parseInt(decimalPlaces);
  if (isNaN(floatVal)) {
    return { val: "NaN", textToSend: textExcludeSubstring, error: true };
  }
  if (isNaN(decimalPlacesNum)) {
    return { val, textToSend: textExcludeSubstring, error: true };
  }
  return { val: floatVal.toFixed(decimalPlacesNum), textToSend: textExcludeSubstring, error: false };
}
const getListOfMenusIncludingUser = (menusWithUsers, userToSend) => {
  const menus = [];
  for (const key in menusWithUsers) {
    if (menusWithUsers[key].includes(userToSend)) {
      menus.push(key);
    }
  }
  return menus;
};
const getParseMode = (val = false) => val ? "HTML" : "Markdown";
const getTypeofTimestamp = (val) => val.includes("lc") ? "lc" : "ts";
const timeStringReplacer = ({ d, h, m, ms, y, s, mo }, string) => {
  if (string) {
    string = string.replace("sss", ms).replace("ss", s).replace("mm", m).replace("hh", h).replace("DD", d).replace("MM", mo).replace("YYYY", y).replace("YY", y.slice(-2)).replace("(", "").replace(")", "");
  }
  return string;
};
function statusIdAndParams(substringExcludeSearch) {
  if (substringExcludeSearch.includes(import_config.config.status.oldWithId)) {
    const splitArray2 = substringExcludeSearch.split(":");
    return {
      id: (0, import_string.removeQuotes)(splitArray2[1]),
      //'id':'ID':true
      shouldChange: (0, import_utils.isTruthy)((0, import_string.removeQuotes)(splitArray2[2]))
    };
  }
  const splitArray = substringExcludeSearch.split(":");
  return {
    id: (0, import_string.removeQuotes)(splitArray[0]),
    //'ID':true
    shouldChange: (0, import_utils.isTruthy)((0, import_string.removeQuotes)(splitArray[1]))
  };
}
function isStartside(startSide) {
  return startSide != "-" && startSide != "";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calcValue,
  checkOneLineValue,
  getListOfMenusIncludingUser,
  getParseMode,
  getTypeofTimestamp,
  isStartside,
  roundValue,
  statusIdAndParams,
  timeStringReplacer
});
//# sourceMappingURL=appUtils.js.map
