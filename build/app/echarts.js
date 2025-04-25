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
var echarts_exports = {};
__export(echarts_exports, {
  getChart: () => getChart
});
module.exports = __toCommonJS(echarts_exports);
var import_main = require("../main");
var import_logging = require("./logging");
var import_telegram = require("./telegram");
var import_utils = require("../lib/utils");
function getChart(echarts, directoryPicture, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
  try {
    if (!echarts) {
      return;
    }
    for (const echart of echarts) {
      const splitPreset = echart.preset.split(".");
      const instanceOfEchart = `${splitPreset[0]}.${splitPreset[1]}`;
      if (!(0, import_utils.validateDirectory)(import_main.adapter, directoryPicture)) {
        return;
      }
      import_main.adapter.sendTo(
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
            userToSend: user,
            textToSend: result.error || directoryPicture + echart.filename,
            telegramInstance: instanceTelegram,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID
          }).catch((e) => {
            (0, import_logging.errorLogger)("Error send to telegram: ", e, import_main.adapter);
          });
        }
      );
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error get chart:", e, import_main.adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getChart
});
//# sourceMappingURL=echarts.js.map
