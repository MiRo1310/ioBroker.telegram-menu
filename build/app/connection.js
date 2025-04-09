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
var connection_exports = {};
__export(connection_exports, {
  checkIsTelegramActive: () => checkIsTelegramActive
});
module.exports = __toCommonJS(connection_exports);
var import_main = __toESM(require("../main"));
var import_logging = require("./logging");
const checkIsTelegramActive = async (dataPoint) => {
  const _this = import_main.default.getInstance();
  await _this.setState("info.connection", false, true);
  const telegramInfoConnection = await _this.getForeignStateAsync(dataPoint);
  (0, import_logging.debug)([{ text: "Telegram Info Connection: ", val: telegramInfoConnection == null ? void 0 : telegramInfoConnection.val }]);
  if (telegramInfoConnection == null ? void 0 : telegramInfoConnection.val) {
    await _this.setState("info.connection", telegramInfoConnection == null ? void 0 : telegramInfoConnection.val, true);
  }
  if (!(telegramInfoConnection == null ? void 0 : telegramInfoConnection.val)) {
    (0, import_logging.info)([{ text: "Telegram was found, but is not running. Please start!" }]);
  }
  return !!(telegramInfoConnection == null ? void 0 : telegramInfoConnection.val);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkIsTelegramActive
});
//# sourceMappingURL=connection.js.map
