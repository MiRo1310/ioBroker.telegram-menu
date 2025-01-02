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
var sendpic_exports = {};
__export(sendpic_exports, {
  sendPic: () => sendPic
});
module.exports = __toCommonJS(sendpic_exports);
var import_telegram = require("./telegram");
var import_utilities = require("./utilities");
var import_child_process = require("child_process");
var import_logging = require("./logging");
var import_main = __toESM(require("../main"));
var import_global = require("./global");
function sendPic(part, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, token, directoryPicture, timeouts, timeoutKey) {
  var _a;
  try {
    (_a = part.sendPic) == null ? void 0 : _a.forEach((element) => {
      const _this = import_main.default.getInstance();
      let path = "";
      if (element.id != "-") {
        const url = element.id;
        const newUrl = (0, import_utilities.replaceAll)(url, "&amp;", "&");
        (0, import_child_process.exec)(
          `curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${element.fileName}`,
          (error2, stdout, stderr) => {
            if (stdout) {
              (0, import_logging.debug)([{ text: "Stdout:", val: stdout }]);
            }
            if (stderr) {
              (0, import_logging.debug)([{ text: "Stderr:", val: stderr }]);
            }
            if (error2) {
              error2([{ text: "Error:", val: error2 }]);
              return;
            }
          }
        );
        (0, import_logging.debug)([{ text: "Delay Time:", val: element.delay }]);
        timeoutKey += 1;
        if (!(0, import_global.checkDirectoryIsOk)(directoryPicture)) {
          return;
        }
        path = `${directoryPicture}${element.fileName}`;
        (0, import_logging.debug)([{ text: "Path : ", val: path }]);
      } else {
        return;
      }
      const timeout = _this.setTimeout(async () => {
        await (0, import_telegram.sendToTelegram)(
          userToSend,
          path,
          void 0,
          instanceTelegram,
          resize_keyboard,
          one_time_keyboard,
          userListWithChatID,
          "false"
        );
        let timeoutToClear = [];
        timeoutToClear = timeouts.filter((item) => item.key == timeoutKey);
        timeoutToClear.forEach((item) => {
          clearTimeout(item.timeout);
        });
        timeouts = timeouts.filter((item) => item.key !== timeoutKey);
        (0, import_logging.debug)([{ text: "Picture sent" }]);
      }, parseInt(element.delay));
      if (timeout) {
        timeouts.push({ key: timeoutKey, timeout });
      }
    });
    return timeouts;
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
  return timeouts;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendPic
});
//# sourceMappingURL=sendpic.js.map
