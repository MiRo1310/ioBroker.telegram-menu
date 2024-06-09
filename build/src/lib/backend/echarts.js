"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChart = void 0;
const main_1 = __importDefault(require("../../main"));
const logging_1 = require("./logging");
const telegram_1 = require("./telegram");
function getChart(echarts, directoryPicture, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
    const _this = main_1.default.getInstance();
    try {
        if (!echarts)
            return;
        for (const echart of echarts) {
            const splitted = echart.preset.split(".");
            const echartInstance = splitted[0] + "." + splitted[1];
            _this.sendTo(echartInstance, {
                preset: echart.preset,
                renderer: "jpg",
                background: echart.background,
                theme: echart.theme,
                quality: 1.0,
                fileOnDisk: directoryPicture + echart.filename,
            }, (result) => {
                (0, telegram_1.sendToTelegram)(user, result.error || directoryPicture + echart.filename, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
            });
        }
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.getChart = getChart;
//# sourceMappingURL=echarts.js.map