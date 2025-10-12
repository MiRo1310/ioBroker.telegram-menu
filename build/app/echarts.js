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
var import_utils = require("@b/lib/utils");
var import_splitValues = require("@b/lib/splitValues");
var import_telegram = require("@b/app/telegram");
var import_logging = require("@b/app/logging");
function getChart(instance, echarts, directoryPicture, user, telegramParams) {
  const adapter = telegramParams.adapter;
  try {
    for (const echart of echarts) {
      const instanceOfEchart = (0, import_splitValues.getEchartsValues)(echart.preset);
      if (!(0, import_utils.validateDirectory)(adapter, directoryPicture)) {
        return;
      }
      adapter.sendTo(
        instanceOfEchart,
        {
          preset: echart.preset,
          renderer: "jpg",
          background: echart.background,
          theme: echart.theme,
          quality: 1,
          fileOnDisk: directoryPicture + echart.filename
        },
        async (result) => {
          const textToSend = result.error || directoryPicture + echart.filename;
          await (0, import_telegram.sendToTelegram)({ instance, userToSend: user, textToSend, telegramParams });
        }
      );
    }
  } catch (e) {
    (0, import_logging.errorLogger)("Error in Echart:", e, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getChart
});
//# sourceMappingURL=echarts.js.map
