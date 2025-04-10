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
var logging_exports = {};
__export(logging_exports, {
  debug: () => debug,
  errorLogger: () => errorLogger,
  info: () => info
});
module.exports = __toCommonJS(logging_exports);
var import_main = require("../main");
[];
const logging = (type, obj) => {
  if (obj) {
    obj.forEach((element) => {
      let text = "";
      if (element.text) {
        text = element.text;
      }
      if (element.val) {
        text += ` ${JSON.stringify(element.val)}`;
      }
      import_main._this.log[type](text);
    });
    return;
  }
};
const info = (obj) => {
  logging("info", obj);
};
const debug = (obj) => {
  logging("debug", obj);
};
const errorLogger = (title, e) => {
  var _a, _b;
  import_main._this.log.error(title);
  import_main._this.log.error(`Error message: ${e.message}`);
  import_main._this.log.error(`Error stack: ${e.stack}`);
  import_main._this.log.error(`Server response: ${(_a = e == null ? void 0 : e.response) == null ? void 0 : _a.status}`);
  import_main._this.log.error(`Server data: ${(_b = e == null ? void 0 : e.response) == null ? void 0 : _b.data}`);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  debug,
  errorLogger,
  info
});
//# sourceMappingURL=logging.js.map
