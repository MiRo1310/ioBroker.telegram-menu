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
var echarts_exports = {};
__export(echarts_exports, {
  getChart: () => getChart
});
module.exports = __toCommonJS(echarts_exports);
var import_main = __toESM(require("../main"));
var import_logging = require("./logging");
var import_telegram = require("./telegram");
var import_global = require("./global");
function getChart(echarts, directoryPicture, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
  const _this = import_main.default.getInstance();
  try {
    if (!echarts) {
      return;
    }
    for (const echart of echarts) {
      const splitPreset = echart.preset.split(".");
      const instanceOfEchart = `${splitPreset[0]}.${splitPreset[1]}`;
      if (!(0, import_global.checkDirectoryIsOk)(directoryPicture)) {
        return;
      }
      _this.sendTo(
        instanceOfEchart,
        {
          preset: echart.preset,
          renderer: "jpg",
          background: echart.background,
          theme: echart.theme,
          quality: 1,
          fileOnDisk: directoryPicture + echart.filename
        },
        (result) => {
          (0, import_telegram.sendToTelegram)({
            user,
            textToSend: result.error || directoryPicture + echart.filename,
            instance: instanceTelegram,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID,
            parse_mode: "false"
          }).catch((e) => {
            (0, import_logging.errorLogger)("Error send to telegram: ", e);
          });
        }
      );
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error get chart:", e);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getChart
});
//# sourceMappingURL=echarts.js.map
