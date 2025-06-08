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
var status_exports = {};
__export(status_exports, {
  checkStatus: () => checkStatus
});
module.exports = __toCommonJS(status_exports);
var import_string = require("../lib/string");
var import_config = require("../config/config");
var import_appUtils = require("../lib/appUtils");
var import_utils = require("../lib/utils");
var import_time = require("../lib/time");
var import_exchangeValue = require("../lib/exchangeValue");
const checkStatus = async (adapter, text) => {
  const { substring, substringExcludeSearch, textExcludeSubstring } = (0, import_string.decomposeText)(
    text,
    import_config.config.status.start,
    import_config.config.status.end
  );
  const { id, shouldChangeByStatusParameter } = (0, import_appUtils.statusIdAndParams)(substringExcludeSearch);
  const stateValue = await adapter.getForeignStateAsync(id);
  if (!(0, import_utils.isDefined)(stateValue == null ? void 0 : stateValue.val)) {
    adapter.log.debug(`State not found for id : "${id}"`);
    return text.replace(substring, "");
  }
  const stateValueString = String(stateValue.val);
  if (text.includes(import_config.config.time)) {
    return (0, import_time.integrateTimeIntoText)(textExcludeSubstring, stateValueString).replace(stateValueString, "");
  }
  const modifiedText = text.replace(substring, "&&");
  const { textToSend, error } = (0, import_exchangeValue.exchangeValue)(adapter, modifiedText, stateValue.val, shouldChangeByStatusParameter);
  return !error ? textToSend : modifiedText;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkStatus
});
//# sourceMappingURL=status.js.map
