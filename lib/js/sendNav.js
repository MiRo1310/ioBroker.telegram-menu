const { sendToTelegram } = require("./telegram");
const { checkStatusInfo } = require("./utilities");

async function sendNav(_this, part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
	if (userToSend) {
		_this.log.debug("Send Nav to Telegram");
		let nav = part.nav;
		let text = await checkStatusInfo(_this, part.text);

		sendToTelegram(_this, userToSend, text, nav, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part.parse_mode);
	}
}
module.exports = {
	sendNav,
};
