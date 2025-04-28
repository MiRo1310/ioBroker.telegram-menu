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
var import_telegram = require("./telegram");
var import_utils = require("../lib/utils");
var import_child_process = require("child_process");
var import_logging = require("./logging");
var import_main = require("../main");
var import_string = require("../lib/string");
var import_appUtils = require("../lib/appUtils");
function sendPic(part, userToSend, telegramParams, userListWithChatID, token, directoryPicture, timeouts, timeoutKey) {
  var _a;
  try {
    (_a = part.sendPic) == null ? void 0 : _a.forEach((element) => {
      const { id, delay, fileName } = element;
      let path = "";
      if ((0, import_appUtils.isStartside)(id)) {
        const newUrl = (0, import_string.replaceAll)(id, "&amp;", "&");
        path = `${directoryPicture}${fileName}`;
        (0, import_child_process.exec)(
          `curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${path}`,
          (error, stdout, stderr) => {
            if (stdout) {
              import_main.adapter.log.debug(`Stdout: ${stdout}`);
            }
            if (stderr) {
              import_main.adapter.log.debug(`Stderr: ${stderr}`);
            }
            if (error) {
              (0, import_logging.errorLogger)("Error in exec:", error, import_main.adapter);
              return;
            }
          }
        );
        import_main.adapter.log.debug(`Delay Time: ${delay}`);
        timeoutKey += 1;
        if (!(0, import_utils.validateDirectory)(import_main.adapter, directoryPicture)) {
          return;
        }
        import_main.adapter.log.debug(`Path: ${path}`);
      } else {
        return;
      }
      const timeout = import_main.adapter.setTimeout(
        async () => {
          await (0, import_telegram.sendToTelegram)({
            userToSend,
            textToSend: path,
            telegramParams,
            userListWithChatID
          });
          let timeoutToClear = [];
          timeoutToClear = timeouts.filter((item) => item.key == timeoutKey);
          timeoutToClear.forEach((item) => {
            import_main.adapter.clearTimeout(item.timeout);
          });
          timeouts = timeouts.filter((item) => item.key !== timeoutKey);
          import_main.adapter.log.debug("Picture sent");
        },
        parseInt(String(element.delay))
      );
      if (timeout) {
        timeouts.push({ key: timeoutKey, timeout });
      }
    });
    return timeouts;
  } catch (e) {
    (0, import_logging.errorLogger)("Error send pic:", e, import_main.adapter);
  }
  return timeouts;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendPic
});
//# sourceMappingURL=sendpic.js.map
