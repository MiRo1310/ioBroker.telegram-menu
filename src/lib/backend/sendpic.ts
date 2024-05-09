const { sendToTelegram } = require("./telegram");
const { replaceAll } = require("./utilities");
const { exec } = require("child_process");
function sendPic(_this: any, part: Part, userToSend: string, instanceTelegram: string, resize_keyboard: boolean, one_time_keyboard: boolean, userListWithChatID: UserListWithChatId[], token: string, directoryPicture: string, timeouts: Timeouts[], timeoutKey: string) {
	_this.log.debug("Send Picture");

	part.sendPic?.forEach((element) => {
		let path = "";
		if (element.id != "-") {
			const url = element.id;
			const newUrl = replaceAll(url, "&amp;", "&");
			try {
				exec(`curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${element.fileName}`, (error: any, stdout: any, stderr: any) => {
					if (stdout) {
						_this.log.debug("Stdout: " + JSON.stringify(stdout));
					}
					if (stderr) {
						_this.log.debug("Stderr: " + JSON.stringify(stderr));
					}
					if (error) {
						_this.log.error("Ein Fehler ist aufgetreten: " + JSON.stringify(error));
						return;
					}
				});
			} catch (e: any) {
				_this.log.error("Error :" + JSON.stringify(e.message));
				_this.log.error(JSON.stringify(e.stack));
			}

			_this.log.debug("Delay Time " + JSON.stringify(element.delay));
			timeoutKey += 1;
			path = `${directoryPicture}${element.fileName}`;
		} else path = element.fileName;
		try {
			const timeout = _this.setTimeout(async () => {
				_this.log.debug("Send Pic to Telegram");
				sendToTelegram(_this, userToSend, path, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
				let timeoutToClear: Timeouts[] = [];
				timeoutToClear = timeouts.filter((item) => item.key == timeoutKey);
				//REVIEW - Changed
				timeoutToClear.forEach((item) => {
					clearTimeout(item.timeout);
				})
				timeouts = timeouts.filter((item) => item.key !== timeoutKey);
			}, parseInt(element.delay));
			_this.log.debug("Timeout add");
			timeouts.push({ key: timeoutKey, timeout: timeout });
		} catch (e: any) {
			_this.log.error("Error: " + JSON.stringify(e.message));
			_this.log.error(JSON.stringify(e.stack));
		}
	});
	_this.log.debug("Picture sended");
	return timeouts;
}

module.exports = { sendPic };
