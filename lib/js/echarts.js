const { sendToTelegram } = require("./telegram");
async function getChart(_this, echarts, directoryPicture, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
	try {
		if (!echarts && !echarts[0].echartInstance) return;
		for (const echart of echarts) {
			const result = await _this.sendTo(echart.echartInstance, {
				preset: echart.preset,
				renderer: "jpg",
				background: echart.background,
				theme: echart.theme,
				quality: 1.0,
				fileOnDisk: directoryPicture + echart.filename,
			});
			if (result && result.error) {
				sendToTelegram(_this, user, result.error, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
			} else if (result) {
				sendToTelegram(_this, user, directoryPicture + echart.filename, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
			} else {
				_this.log.debug("No result");
				sendToTelegram(_this, user, "No result", [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
			}
		}
	} catch (e) {
		_this.log.error("Error getChart: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
module.exports = {
	getChart,
};
