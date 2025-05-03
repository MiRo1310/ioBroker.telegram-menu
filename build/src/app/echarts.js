"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChart = getChart;
const main_1 = require("../main");
const logging_1 = require("./logging");
const telegram_1 = require("./telegram");
const utils_1 = require("../lib/utils");
function getChart(echarts, directoryPicture, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
    try {
        if (!echarts) {
            return;
        }
        for (const echart of echarts) {
            const splitPreset = echart.preset.split('.');
            const instanceOfEchart = `${splitPreset[0]}.${splitPreset[1]}`;
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
            }, (result) => {
                (0, telegram_1.sendToTelegram)({
                    userToSend: user,
                    textToSend: result.error || directoryPicture + echart.filename,
                    telegramInstance: instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                }).catch((e) => {
                    (0, logging_1.errorLogger)('Error send to telegram: ', e, main_1.adapter);
                });
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error get chart:', e, main_1.adapter);
    }
}
//# sourceMappingURL=echarts.js.map