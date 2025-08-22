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
var instance_exports = {};
__export(instance_exports, {
  isInstanceActive: () => isInstanceActive
});
module.exports = __toCommonJS(instance_exports);
const isInstanceActive = (telegramInstanceList, instance) => {
  var _a, _b;
  return (_b = (_a = telegramInstanceList.find((i) => i.name === instance)) == null ? void 0 : _a.active) != null ? _b : false;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isInstanceActive
});
//# sourceMappingURL=instance.js.map
