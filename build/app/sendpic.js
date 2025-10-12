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
var sendpic_exports = {};
__export(sendpic_exports, {
  sendPic: () => sendPic
});
module.exports = __toCommonJS(sendpic_exports);
var import_appUtils = require("@b/lib/appUtils");
var import_string = require("@b/lib/string");
var import_utils = require("@b/lib/utils");
var import_exec = require("@b/app/exec");
var import_telegram = require("@b/app/telegram");
var import_logging = require("@b/app/logging");
function sendPic(instance, part, userToSend, telegramParams, token, directoryPicture, timeouts, timeoutKey) {
  var _a;
  const adapter = telegramParams.adapter;
  try {
    (_a = part.sendPic) == null ? void 0 : _a.forEach((element, index) => {
      const { id, delay, fileName } = element;
      let path = "";
      if (!(0, import_appUtils.isStartside)(id)) {
        return;
      }
      const url = (0, import_string.replaceAll)(id, "&amp;", "&");
      path = `${directoryPicture}${fileName}`;
      if (!(0, import_utils.validateDirectory)(adapter, directoryPicture)) {
        return;
      }
      if (delay <= 0) {
        (0, import_exec.loadWithCurl)(
          adapter,
          token,
          path,
          url,
          async () => await (0, import_telegram.sendToTelegram)({
            instance,
            userToSend,
            textToSend: path,
            telegramParams
          })
        );
        return;
      }
      (0, import_exec.loadWithCurl)(adapter, token, path, url);
      timeoutKey += index;
      const timeout = adapter.setTimeout(
        async () => {
          await (0, import_telegram.sendToTelegram)({
            instance,
            userToSend,
            textToSend: path,
            telegramParams
          });
          let timeoutToClear = void 0;
          timeoutToClear = timeouts.find((item) => item.key == timeoutKey);
          adapter.clearTimeout(timeoutToClear == null ? void 0 : timeoutToClear.timeout);
          timeouts = timeouts.filter((item) => item.key !== timeoutKey);
          adapter.log.debug(`Picture has been send with delay ${delay}, path : ${path}`);
        },
        parseInt(String(element.delay))
      );
      if (timeout) {
        timeouts.push({ key: timeoutKey, timeout });
      }
    });
    return timeouts;
  } catch (e) {
    (0, import_logging.errorLogger)("Error send pic:", e, adapter);
  }
  return timeouts;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendPic
});
//# sourceMappingURL=sendpic.js.map
