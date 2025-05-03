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
var utils_exports = {};
__export(utils_exports, {
  deepCopy: () => deepCopy,
  getChatID: () => getChatID,
  isDefined: () => isDefined,
  isFalsy: () => isFalsy,
  isTruthy: () => isTruthy,
  validateDirectory: () => validateDirectory
});
module.exports = __toCommonJS(utils_exports);
var import_logging = require("../app/logging");
const getChatID = (userListWithChatID, user) => {
  for (const element of userListWithChatID) {
    if (element.name === user) {
      return element.chatID;
    }
  }
  return;
};
const isDefined = (value) => value !== void 0 && value !== null;
const deepCopy = (obj, adapter) => {
  try {
    return !isDefined(obj) ? void 0 : JSON.parse(JSON.stringify(obj));
  } catch (err) {
    (0, import_logging.errorLogger)(`Error deepCopy: `, err, adapter);
  }
};
function validateDirectory(adapter, directory) {
  if (!isDefined(directory) || directory === "") {
    adapter.log.error(
      "No directory to save the picture. Please add a directory in the settings with full read and write permissions."
    );
    return false;
  }
  return true;
}
const isTruthy = (value) => isDefined(value) && ["1", 1, true, "true"].includes(value);
const isFalsy = (value) => ["0", 0, false, "false", void 0, null].includes(value);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deepCopy,
  getChatID,
  isDefined,
  isFalsy,
  isTruthy,
  validateDirectory
});
//# sourceMappingURL=utils.js.map
