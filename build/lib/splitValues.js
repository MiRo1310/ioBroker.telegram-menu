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
var splitValues_exports = {};
__export(splitValues_exports, {
  getBindingValues: () => getBindingValues,
  getMenuValues: () => getMenuValues,
  getProcessTimeValues: () => getProcessTimeValues
});
module.exports = __toCommonJS(splitValues_exports);
var import_string = require("./string");
var import_appUtils = require("./appUtils");
const getMenuValues = (str) => {
  const splitText = str.split(":");
  return { callbackData: splitText[1], menuToHandle: splitText[2], val: splitText[3] };
};
function getProcessTimeValues(substringExcludeSearch) {
  var _a, _b;
  const array = substringExcludeSearch.split(",");
  return {
    typeofTimestamp: (0, import_appUtils.getTypeofTimestamp)(array[0]),
    timeString: (_a = array[1]) != null ? _a : "",
    idString: (0, import_string.replaceAllItems)((_b = array[2]) != null ? _b : "", ["id:", "}", "'"])
  };
}
function getBindingValues(item) {
  const array = item.split(":");
  return { key: array[0], id: array[1] };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getBindingValues,
  getMenuValues,
  getProcessTimeValues
});
//# sourceMappingURL=splitValues.js.map
