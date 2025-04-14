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
  extractTimeValues: () => extractTimeValues,
  getTimeWithPad: () => getTimeWithPad,
  integrateTimeIntoText: () => integrateTimeIntoText,
  toLocaleDate: () => toLocaleDate
});
module.exports = __toCommonJS(time_exports);
var import_config = require("../config/config");
var import_string = require("./string");
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
    return text.replace(import_config.config.time, '"Invalid Date"');
  }
  const date = new Date(Number(String(val)));
  return text.replace(import_config.config.time, isNaN(date.getTime()) ? '"Invalid Date"' : toLocaleDate(date));
};
function extractTimeValues(tsInMs) {
  var _a;
  if (isNaN(tsInMs) || tsInMs < 0) {
    return { milliseconds: NaN, seconds: NaN, minutes: NaN, hours: NaN, day: NaN, month: NaN, year: NaN };
  }
  const date = new Date(tsInMs);
  const milliseconds = date.getMilliseconds();
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = Number(
    (_a = new Intl.DateTimeFormat(import_config.defaultLocale, {
      hour: "2-digit",
      hour12: false,
      timeZone: import_config.timezone
    }).formatToParts(new Date(tsInMs)).find((part) => part.type === "hour")) == null ? void 0 : _a.value
  );
  const day = Number(date.toLocaleString(import_config.defaultLocale, { day: "2-digit" }));
  const month = Number(date.toLocaleString(import_config.defaultLocale, { month: "2-digit" }));
  const year = Number(date.toLocaleString(import_config.defaultLocale, { year: "numeric" }));
  return { milliseconds, seconds, minutes, hours, day, month, year };
}
function getTimeWithPad({
  milliseconds,
  seconds,
  day,
  minutes,
  year,
  month,
  hours
}) {
  return {
    ms: (0, import_string.pad)(milliseconds, 3),
    s: (0, import_string.pad)(seconds),
    m: (0, import_string.pad)(minutes),
    h: (0, import_string.pad)(hours),
    d: (0, import_string.pad)(day),
    mo: (0, import_string.pad)(month),
    y: year.toString()
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  extractTimeValues,
  getTimeWithPad,
  integrateTimeIntoText,
  toLocaleDate
});
//# sourceMappingURL=time.js.map
