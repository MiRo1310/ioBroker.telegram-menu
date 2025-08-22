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
var parseMode_exports = {};
__export(parseMode_exports, {
  isParseModeFirstElement: () => isParseModeFirstElement
});
module.exports = __toCommonJS(parseMode_exports);
const isParseModeFirstElement = (part) => {
  var _a;
  return (_a = part.getData) == null ? void 0 : _a[0].parse_mode;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isParseModeFirstElement
});
//# sourceMappingURL=parseMode.js.map
