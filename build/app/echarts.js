"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChart = getChart;
const utils_1 = require("../lib/utils");
const splitValues_1 = require("../lib/splitValues");
const telegram_1 = require("../app/telegram");
function getChart(instance, echarts, user, appContext) {
    for (const echart of echarts) {
        const instanceOfEchart = (0, splitValues_1.getEchartsValues)(echart.preset);
        if (!instanceOfEchart) {
            appContext.adapter.log.warn('Echart Instance not found');
            return;
        }
        if (!(0, utils_1.validateDirectory)(appContext)) {
            return;
        }
        const targetInstance = echart.echartsInstance || instanceOfEchart;
        appContext.adapter.sendTo(targetInstance, 'send', {
            preset: echart.preset,
            renderer: 'jpg',
            background: echart.background,
            theme: echart.theme,
            quality: 1.0,
            fileOnDisk: appContext.directoryPicture + echart.filename,
        }, async (result) => {
            const textToSend = result.error || appContext.directoryPicture + echart.filename;
            await (0, telegram_1.sendToTelegram)({ instance, userToSend: user, textToSend, appContext });
        });
    }
}
//# sourceMappingURL=echarts.js.map