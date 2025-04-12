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
  deleteDoubleEntriesInArray: () => deleteDoubleEntriesInArray,
  isFalsy: () => isFalsy,
  isString: () => isString,
  isTruthy: () => isTruthy
});
module.exports = __toCommonJS(global_exports);
const deleteDoubleEntriesInArray = (arr) => arr.filter((item, index) => arr.indexOf(item) === index);
const isString = (value) => typeof value === "string";
const isTruthy = (value) => ["1", 1, true, "true"].includes(value);
const isFalsy = (value) => ["0", 0, false, "false", void 0, null].includes(value);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deleteDoubleEntriesInArray,
  isFalsy,
  isString,
  isTruthy
});
//# sourceMappingURL=global.js.map
