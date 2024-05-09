const { sendToTelegram } = require("./telegram");
const { checkStatusInfo } = require("./utilities");

async function sendNav(_this: any, part: Part, userToSend: string, instanceTelegram: string, userListWithChatID: UserListWithChatId, resize_keyboard: boolean, one_time_keyboard: boolean) {
	if (userToSend) {
		_this.log.debug("Send Nav to Telegram");
		const nav = part.nav;
		const text = await checkStatusInfo(_this, part.text);

		sendToTelegram(_this, userToSend, text, nav, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part.parse_mode);
	}
}
module.exports = {
	sendNav,
};
