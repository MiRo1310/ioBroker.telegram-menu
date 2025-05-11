"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChart = getChart;
const main_1 = require("../main");
const logging_1 = require("./logging");
const telegram_1 = require("./telegram");
const utils_1 = require("../lib/utils");
const splitValues_1 = require("../lib/splitValues");
function getChart(echarts, directoryPicture, user, telegramParams) {
    try {
        for (const echart of echarts) {
            const instanceOfEchart = (0, splitValues_1.getEchartsValues)(echart.preset);
            if (!(0, utils_1.validateDirectory)(main_1.adapter, directoryPicture)) {
                return;
            }
            main_1.adapter.sendTo(instanceOfEchart, {
                preset: echart.preset,
                renderer: 'jpg',
                background: echart.background,
                theme: echart.theme,
                quality: 1.0,
                fileOnDisk: directoryPicture + echart.filename,
            }, async (result) => {
                const textToSend = result.error || directoryPicture + echart.filename;
                await (0, telegram_1.sendToTelegram)({ userToSend: user, textToSend, telegramParams });
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error in Echart:', e, main_1.adapter);
    }
}
//# sourceMappingURL=echarts.js.map