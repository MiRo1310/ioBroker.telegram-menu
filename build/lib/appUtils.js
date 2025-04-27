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
  exchangePlaceholderWithValue: () => exchangePlaceholderWithValue,
  getListOfMenusIncludingUser: () => getListOfMenusIncludingUser,
  getNewStructure: () => getNewStructure,
  getParseMode: () => getParseMode,
  getStartSides: () => getStartSides,
  getTypeofTimestamp: () => getTypeofTimestamp,
  isStartside: () => isStartside,
  roundValue: () => roundValue,
  splitNavigation: () => splitNavigation,
  statusIdAndParams: () => statusIdAndParams,
  timeStringReplacer: () => timeStringReplacer
});
module.exports = __toCommonJS(appUtils_exports);
var import_config = require("../config/config");
var import_string = require("./string");
var import_math = require("./math");
var import_utils = require("./utils");
var import_object = require("./object");
var import_appUtilsString = require("./appUtilsString");
const checkOneLineValue = (text) => !text.includes(import_config.config.rowSplitter) ? `${text} ${import_config.config.rowSplitter}` : text;
function calcValue(textToSend, val, adapter) {
  const { substringExcludeSearch, textExcludeSubstring } = (0, import_string.decomposeText)(
    textToSend,
    import_config.config.math.start,
    import_config.config.math.end
  );
  const { val: evalVal, error } = (0, import_math.evaluate)([val, substringExcludeSearch], adapter);
  return error ? { textToSend: textExcludeSubstring, calculated: val, error } : { textToSend: textExcludeSubstring, calculated: evalVal, error };
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
    return { roundedValue: "NaN", text: textExcludeSubstring, error: true };
  }
  if (isNaN(decimalPlacesNum)) {
    return { roundedValue: val, text: textExcludeSubstring, error: true };
  }
  return { roundedValue: floatVal.toFixed(decimalPlacesNum), text: textExcludeSubstring, error: false };
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
  var _a, _b;
  const splitArray = substringExcludeSearch.split(":");
  const firstEl = splitArray[0];
  const secondEl = (_a = splitArray[1]) != null ? _a : "";
  const thirdEl = (_b = splitArray[2]) != null ? _b : "";
  if (substringExcludeSearch.includes(import_config.config.status.oldWithId)) {
    return {
      id: (0, import_string.removeQuotes)(secondEl),
      //'id':'ID':true
      shouldChange: (0, import_utils.isTruthy)((0, import_string.removeQuotes)(thirdEl))
    };
  }
  return {
    id: (0, import_string.removeQuotes)(firstEl),
    //'ID':true
    shouldChange: (0, import_utils.isTruthy)((0, import_string.removeQuotes)(secondEl))
  };
}
function isStartside(startSide) {
  return startSide != "-" && startSide != "";
}
function splitNavigation(rows) {
  const generatedNavigation = [];
  rows.forEach(({ value, text, parse_mode, call }) => {
    const nav = [];
    checkOneLineValue(value).split(import_config.config.rowSplitter).forEach(function(el, index) {
      nav[index] = (0, import_object.trimAllItems)(el.split(","));
    });
    generatedNavigation.push({ call, text, parse_mode: (0, import_utils.isTruthy)(parse_mode), nav });
  });
  return generatedNavigation;
}
function getNewStructure(val) {
  const obj = {};
  val.forEach(function({ nav, text, parse_mode, call }) {
    obj[call] = { nav, text, parse_mode };
  });
  return obj;
}
const getStartSides = (menusWithUsers, dataObject) => {
  const startSides = {};
  Object.keys(menusWithUsers).forEach((element) => {
    startSides[element] = dataObject.nav[element][0].call;
  });
  return startSides;
};
const exchangePlaceholderWithValue = (textToSend, val) => {
  const searchString = (0, import_appUtilsString.getPlaceholderValue)(textToSend);
  if (searchString !== "") {
    return textToSend.replace(searchString, val.toString()).trim();
  }
  return `${textToSend} ${val}`.trim();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calcValue,
  checkOneLineValue,
  exchangePlaceholderWithValue,
  getListOfMenusIncludingUser,
  getNewStructure,
  getParseMode,
  getStartSides,
  getTypeofTimestamp,
  isStartside,
  roundValue,
  splitNavigation,
  statusIdAndParams,
  timeStringReplacer
});
//# sourceMappingURL=appUtils.js.map
