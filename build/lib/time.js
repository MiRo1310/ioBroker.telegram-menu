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
var time_exports = {};
__export(time_exports, {
  integrateTimeIntoText: () => integrateTimeIntoText,
  toLocaleDate: () => toLocaleDate
});
module.exports = __toCommonJS(time_exports);
var import_config = require("../config/config");
const toLocaleDate = (ts) => {
  return ts.toLocaleDateString(import_config.defaultLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: import_config.timezone
  });
};
const integrateTimeIntoText = (text, val) => {
  if (!val) {
    return text.replace(import_config.config.replacer.time, '"Invalid Date"');
  }
  const date = new Date(Number(String(val)));
  return text.replace(import_config.config.replacer.time, isNaN(date.getTime()) ? '"Invalid Date"' : toLocaleDate(date));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  integrateTimeIntoText,
  toLocaleDate
});
//# sourceMappingURL=time.js.map
