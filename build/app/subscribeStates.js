"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var subscribeStates_exports = {};
__export(subscribeStates_exports, {
  _subscribeAndUnSubscribeForeignStatesAsync: () => _subscribeAndUnSubscribeForeignStatesAsync,
  _subscribeForeignStatesAsync: () => _subscribeForeignStatesAsync
});
module.exports = __toCommonJS(subscribeStates_exports);
var import_main = __toESM(require("../main"));
var import_global = require("./global");
var import_logging = require("./logging");
async function _subscribeAndUnSubscribeForeignStatesAsync(obj) {
  const _this = import_main.default.getInstance();
  if (obj.id) {
    (0, import_logging.debug)([
      { text: "ID to subscribe:", val: obj.id },
      { text: "Subscribe:", val: await _this.subscribeForeignStatesAsync(obj.id) }
    ]);
  } else if (obj.array) {
    for (const element of obj.array) {
      await _this.subscribeForeignStatesAsync(element.id);
    }
  }
}
async function _subscribeForeignStatesAsync(array) {
  const _this = import_main.default.getInstance();
  array = (0, import_global.deleteDoubleEntriesInArray)(array);
  for (const element of array) {
    await _this.subscribeForeignStatesAsync(element);
  }
  (0, import_logging.debug)([{ text: "Subscribe all States of:", val: array }]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  _subscribeAndUnSubscribeForeignStatesAsync,
  _subscribeForeignStatesAsync
});
//# sourceMappingURL=subscribeStates.js.map
