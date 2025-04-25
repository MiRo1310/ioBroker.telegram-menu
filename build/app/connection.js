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
var connection_exports = {};
__export(connection_exports, {
  checkIsTelegramActive: () => checkIsTelegramActive
});
module.exports = __toCommonJS(connection_exports);
var import_main = require("../main");
var import_string = require("../lib/string");
const checkIsTelegramActive = async (dataPoint) => {
  await import_main.adapter.setState("info.connection", false, true);
  const telegramInfoConnection = await import_main.adapter.getForeignStateAsync(dataPoint);
  import_main.adapter.log.debug(`Telegram Info Connection: ${(0, import_string.jsonString)(telegramInfoConnection)}`);
  const value = telegramInfoConnection == null ? void 0 : telegramInfoConnection.val;
  if (value) {
    await import_main.adapter.setState("info.connection", telegramInfoConnection == null ? void 0 : telegramInfoConnection.val, true);
  } else {
    import_main.adapter.log.info("Telegram was found, but is not running. Please start!");
  }
  return !!value;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkIsTelegramActive
});
//# sourceMappingURL=connection.js.map
