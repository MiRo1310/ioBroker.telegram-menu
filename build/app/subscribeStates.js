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
var subscribeStates_exports = {};
__export(subscribeStates_exports, {
  _subscribeAndUnSubscribeForeignStatesAsync: () => _subscribeAndUnSubscribeForeignStatesAsync,
  _subscribeForeignStatesAsync: () => _subscribeForeignStatesAsync
});
module.exports = __toCommonJS(subscribeStates_exports);
var import_main = require("../main");
var import_string = require("../lib/string");
var import_object = require("../lib/object");
async function _subscribeAndUnSubscribeForeignStatesAsync(obj) {
  if (obj.id) {
    import_main.adapter.log.debug(`Subscribe to ${obj.id}`);
  } else if (obj.array) {
    for (const element of obj.array) {
      await import_main.adapter.subscribeForeignStatesAsync(element.id);
    }
  }
}
async function _subscribeForeignStatesAsync(array) {
  array = (0, import_object.removeDuplicates)(array);
  for (const element of array) {
    await import_main.adapter.subscribeForeignStatesAsync(element);
  }
  import_main.adapter.log.debug(`Subscribe all States of: ${(0, import_string.jsonString)(array)}`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  _subscribeAndUnSubscribeForeignStatesAsync,
  _subscribeForeignStatesAsync
});
//# sourceMappingURL=subscribeStates.js.map
