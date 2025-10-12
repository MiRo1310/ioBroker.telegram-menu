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
  areAllCheckTelegramInstancesActive: () => areAllCheckTelegramInstancesActive
});
module.exports = __toCommonJS(connection_exports);
var import_configVariables = require("@b/app/configVariables");
var import_string = require("@b/lib/string");
const areAllCheckTelegramInstancesActive = async (params) => {
  var _a;
  const { adapter } = params;
  const { telegramInfoConnectionID } = import_configVariables.getIds;
  await adapter.setState("info.connection", false, true);
  for (const instance of params.telegramInstanceList) {
    if (!(instance == null ? void 0 : instance.active) || !(instance == null ? void 0 : instance.name)) {
      continue;
    }
    const id = telegramInfoConnectionID(instance.name);
    const telegramInfoConnection = await adapter.getForeignStateAsync(id);
    adapter.log.debug(`Telegram Info Connection: ${(0, import_string.jsonString)(telegramInfoConnection)}`);
    if (!telegramInfoConnection) {
      adapter.log.error(`The State ${id} was not found!`);
      return false;
    }
    const value = telegramInfoConnection == null ? void 0 : telegramInfoConnection.val;
    await adapter.setState("info.connection", (_a = telegramInfoConnection == null ? void 0 : telegramInfoConnection.val) != null ? _a : false, true);
    if (!value) {
      adapter.log.info("A Selected instance of telegram is not running. Please start!");
      return false;
    }
  }
  await adapter.setState("info.connection", true, true);
  return true;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  areAllCheckTelegramInstancesActive
});
//# sourceMappingURL=connection.js.map
