"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { sendToTelegram } = require("./telegram");
function getChart(_this, echarts, directoryPicture, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
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
                if (result && result.error) {
                    sendToTelegram(_this, user, result.error, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
                }
                else {
                    sendToTelegram(_this, user, directoryPicture + echart.filename, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
                }
            });
        }
    }
    catch (e) {
        _this.log.error("Error getChart: " + JSON.stringify(e.message));
        _this.log.error(JSON.stringify(e.stack));
    }
}
module.exports = {
    getChart,
};
//# sourceMappingURL=echarts.js.map