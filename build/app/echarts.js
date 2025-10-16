"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChart = getChart;
const utils_1 = require("../lib/utils");
const splitValues_1 = require("../lib/splitValues");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
function getChart(instance, echarts, directoryPicture, user, telegramParams) {
    const adapter = telegramParams.adapter;
    try {
        for (const echart of echarts) {
            const instanceOfEchart = (0, splitValues_1.getEchartsValues)(echart.preset);
            if (!(0, utils_1.validateDirectory)(adapter, directoryPicture)) {
                return;
            }
            adapter.sendTo(instanceOfEchart, {
                preset: echart.preset,
                renderer: 'jpg',
                background: echart.background,
                theme: echart.theme,
                quality: 1.0,
                fileOnDisk: directoryPicture + echart.filename,
            }, async (result) => {
                const textToSend = result.error || directoryPicture + echart.filename;
                await (0, telegram_1.sendToTelegram)({ instance, userToSend: user, textToSend, telegramParams });
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error in Echart:', e, adapter);
    }
}
//# sourceMappingURL=echarts.js.map