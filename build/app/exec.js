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
var exec_exports = {};
__export(exec_exports, {
  loadWithCurl: () => loadWithCurl
});
module.exports = __toCommonJS(exec_exports);
var import_logging = require("./logging");
var import_child_process = require("child_process");
function loadWithCurl(adapter, token, path, url, callback) {
  (0, import_child_process.exec)(
    `curl -H "Authorization: Bearer ${token.trim()}" "${url}" > ${path}`,
    (error, stdout, stderr) => {
      if (stdout) {
        adapter.log.debug(`Stdout : "${stdout}"`);
      }
      if (stderr) {
        adapter.log.debug(`Stderr : "${stderr}"`);
      }
      if (error) {
        (0, import_logging.errorLogger)("Error in exec:", error, adapter);
        return;
      }
      if (!callback) {
        return;
      }
      adapter.log.debug("Curl command executed successfully");
      callback();
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loadWithCurl
});
//# sourceMappingURL=exec.js.map
