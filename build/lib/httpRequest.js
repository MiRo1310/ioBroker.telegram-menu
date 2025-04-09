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
var import_global = require("./global");
async function httpRequest(parts, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture) {
  if (!parts.httpRequest) {
    return;
  }
  for (const part of parts.httpRequest) {
    const url = part.url;
    const userName = part.user;
    const password = part.password;
    const method = "get";
    (0, import_logging.debug)([{ text: "URL:", val: url }]);
    try {
      const response = await (0, import_axios.default)(
        userName && password ? {
          method,
          url,
          responseType: "arraybuffer",
          auth: {
            username: userName,
            password
          }
        } : {
          method,
          url,
          responseType: "arraybuffer"
        }
      );
      if (!part.filename) {
        return;
      }
      if (!(0, import_global.checkDirectoryIsOk)(directoryPicture)) {
        return;
      }
      const imagePath = import_path.default.join(directoryPicture, part.filename);
      import_fs.default.writeFileSync(imagePath, Buffer.from(response.data), "binary");
      (0, import_logging.debug)([{ text: "Pic saved:", val: imagePath }]);
      await (0, import_telegram.sendToTelegram)({
        user: userToSend,
        textToSend: imagePath,
        instance: instanceTelegram,
        resize_keyboard,
        one_time_keyboard,
        userListWithChatID,
        parse_mode: "false"
      });
    } catch (e) {
      (0, import_logging.error)([
        { text: "Error:", val: e.message },
        { text: "Stack:", val: e.stack },
        { text: "Server Response:", val: e.response.status },
        { text: "Server data:", val: e.response.data }
      ]);
    }
  }
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  httpRequest
});
//# sourceMappingURL=httpRequest.js.map
