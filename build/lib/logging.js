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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var logging_exports = {};
__export(logging_exports, {
  debug: () => debug,
  error: () => error,
  info: () => info
});
module.exports = __toCommonJS(logging_exports);
var import_main = __toESM(require("../main"));
[];
let _this;
const logging = (type, obj) => {
  if (!_this) {
    _this = import_main.default.getInstance();
  }
  if (obj) {
    obj.forEach((element) => {
      let text = "";
      if (element.text) {
        text = element.text;
      }
      if (element.val) {
        text += " " + JSON.stringify(element.val);
      }
      _this.log[type](text);
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
const error = (obj) => {
  logging("error", obj);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  debug,
  error,
  info
});
//# sourceMappingURL=logging.js.map
