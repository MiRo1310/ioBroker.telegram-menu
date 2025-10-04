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
var config_exports = {};
__export(config_exports, {
  arrayOfEntries: () => arrayOfEntries,
  backMenuLength: () => backMenuLength,
  config: () => config,
  defaultLocale: () => defaultLocale,
  invalidId: () => invalidId,
  timezone: () => timezone
});
module.exports = __toCommonJS(config_exports);
const defaultLocale = "de-DE";
const timezone = "Europe/Berlin";
const backMenuLength = 20;
const invalidId = "Invalid ID";
const config = {
  time: "{time}",
  change: {
    start: "change{",
    end: "}",
    command: "change"
  },
  rowSplitter: "&&",
  math: {
    start: "{math:",
    end: "}"
  },
  round: {
    start: "{round:",
    end: "}"
  },
  timestamp: {
    start: "{time.",
    end: "}",
    lc: "{time.lc",
    ts: "{time.ts"
  },
  status: {
    start: "{status:",
    end: "}",
    oldWithId: "'id':"
  },
  set: {
    start: "{set:",
    end: "}"
  },
  json: {
    start: "{json",
    end: "}",
    textTable: "TextTable"
  },
  binding: {
    start: "binding:{",
    end: "}",
    splitChar: ";"
  },
  functionSelektor: "functions=",
  modifiedValue: "{value}",
  dynamicValue: {
    start: "{id:",
    end: "}"
  },
  setDynamicValue: "{setDynamicValue"
};
const arrayOfEntries = [
  {
    objName: "echarts",
    name: "echarts",
    loop: "preset",
    elements: [
      { name: "preset" },
      { name: "echartInstance" },
      { name: "background" },
      { name: "theme" },
      { name: "filename" }
    ]
  },
  {
    objName: "loc",
    name: "location",
    loop: "latitude",
    elements: [{ name: "latitude" }, { name: "longitude" }, { name: "parse_mode", index: 0 }]
  },
  {
    objName: "pic",
    name: "sendPic",
    loop: "IDs",
    elements: [{ name: "id", value: "IDs" }, { name: "fileName" }, { name: "delay", value: "picSendDelay" }]
  },
  {
    objName: "get",
    name: "getData",
    loop: "IDs",
    elements: [
      { name: "id", value: "IDs" },
      { name: "text", type: "text" },
      { name: "newline", value: "newline_checkbox" },
      { name: "parse_mode", index: 0 }
    ]
  },
  {
    objName: "httpRequest",
    name: "httpRequest",
    loop: "url",
    elements: [{ name: "url" }, { name: "user" }, { name: "password" }, { name: "filename" }]
  }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  arrayOfEntries,
  backMenuLength,
  config,
  defaultLocale,
  invalidId,
  timezone
});
//# sourceMappingURL=config.js.map
