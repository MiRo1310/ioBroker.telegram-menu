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
var json_exports = {};
__export(json_exports, {
  escapeJsonString: () => escapeJsonString,
  makeValidJson: () => makeValidJson
});
module.exports = __toCommonJS(json_exports);
var import_logging = require("../app/logging");
const escapeJsonString = (input) => {
  return input.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/'/g, '"');
};
const makeValidJson = (input, adapter) => {
  try {
    const sanitizedInput = input.trim();
    const parsed = JSON.parse(sanitizedInput);
    return { validJson: JSON.stringify(parsed), error: false };
  } catch (error) {
    console.log(error);
    try {
      const escapedString = escapeJsonString(input);
      const parsed = JSON.parse(escapedString);
      return { validJson: JSON.stringify(parsed), error: false };
    } catch (innerError) {
      (0, import_logging.errorLogger)("Error makeValidJson:", innerError, adapter);
      return { validJson: input, error: true };
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  escapeJsonString,
  makeValidJson
});
//# sourceMappingURL=json.js.map
