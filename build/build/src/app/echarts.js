"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChart = getChart;
const main_1 = require("../main");
const logging_1 = require("./logging");
const telegram_1 = require("./telegram");
const global_1 = require("./global");
function getChart(echarts, directoryPicture, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
    try {
        if (!echarts) {
            return;
        }
        for (const echart of echarts) {
            const splitPreset = echart.preset.split('.');
            const instanceOfEchart = `${splitPreset[0]}.${splitPreset[1]}`;
            if (!(0, global_1.checkDirectoryIsOk)(directoryPicture)) {
                return;
            }
            main_1._this.sendTo(instanceOfEchart, {
                preset: echart.preset,
                renderer: 'jpg',
                background: echart.background,
                theme: echart.theme,
                quality: 1.0,
                fileOnDisk: directoryPicture + echart.filename,
            }, (result) => {
                (0, telegram_1.sendToTelegram)({
                    user: user,
                    textToSend: result.error || directoryPicture + echart.filename,
                    instance: instanceTelegram,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                    userListWithChatID: userListWithChatID,
                    parse_mode: 'false',
                }).catch((e) => {
                    (0, logging_1.errorLogger)('Error send to telegram: ', e);
                });
            });
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error get chart:', e);
    }
}
