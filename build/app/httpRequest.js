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
var httpRequest_exports = {};
__export(httpRequest_exports, {
  httpRequest: () => httpRequest
});
module.exports = __toCommonJS(httpRequest_exports);
var import_axios = __toESM(require("axios"));
var import_telegram = require("./telegram");
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var import_logging = require("./logging");
var import_utils = require("../lib/utils");
async function httpRequest(adapter, instance, parts, userToSend, telegramParams, directoryPicture) {
  if (!parts.httpRequest) {
    return;
  }
  for (const { url, password, user: username, filename } of parts.httpRequest) {
    adapter.log.debug(`URL : ${url}`);
    try {
      const response = await (0, import_axios.default)(
        username && password ? {
          method: "get",
          url,
          responseType: "arraybuffer",
          auth: {
            username,
            password
          }
        } : {
          method: "get",
          url,
          responseType: "arraybuffer"
        }
      );
      if (!(0, import_utils.validateDirectory)(adapter, directoryPicture)) {
        return;
      }
      const imagePath = import_path.default.join(directoryPicture, filename);
      import_fs.default.writeFileSync(imagePath, Buffer.from(response.data), "binary");
      adapter.log.debug(`Pic saved : ${imagePath}`);
      await (0, import_telegram.sendToTelegram)({
        instance,
        userToSend,
        textToSend: imagePath,
        telegramParams
      });
    } catch (e) {
      (0, import_logging.errorLogger)("Error http request:", e, adapter);
    }
  }
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  httpRequest
});
//# sourceMappingURL=httpRequest.js.map
