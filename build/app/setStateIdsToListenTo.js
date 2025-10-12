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
var setStateIdsToListenTo_exports = {};
__export(setStateIdsToListenTo_exports, {
  addSetStateIds: () => addSetStateIds,
  getStateIdsToListenTo: () => getStateIdsToListenTo
});
module.exports = __toCommonJS(setStateIdsToListenTo_exports);
var import_subscribeStates = require("./subscribeStates");
var import_object = require("../lib/object");
const setStateIdsToListenTo = [];
function getStateIdsToListenTo() {
  return setStateIdsToListenTo;
}
async function addSetStateIds(adapter, setStateId) {
  if (!setStateIdsToListenTo.find((list) => list.id === setStateId.id)) {
    setStateIdsToListenTo.push(setStateId);
    await (0, import_subscribeStates._subscribeForeignStates)(adapter, (0, import_object.setStateIdsToIdArray)([setStateId]));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addSetStateIds,
  getStateIdsToListenTo
});
//# sourceMappingURL=setStateIdsToListenTo.js.map
