const { callSubMenu, backMenuFunc } = require("./subMenu.js");
const { checkStatusInfo } = require("./utilities.js");
const { sendToTelegram } = require("./telegram.js");

async function sendNav(_this, part, call, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, groupData, menuData, menus, setStateIdsToListenTo) {
	_this.log.debug("Menu to Send: " + JSON.stringify(part.nav));
	backMenuFunc(_this, call, part.nav, userToSend);
	if (JSON.stringify(part.nav).includes("menu:")) {
		_this.log.debug("Submenu");
		callSubMenu(
			_this,
			JSON.stringify(part.nav),
			groupData,
			userToSend,
			instanceTelegram,
			resize_keyboard,
			one_time_keyboard,
			userListWithChatID,
			part,
			menuData,
			menus,
			setStateIdsToListenTo,
		);
		return true;
	} else {
		if (userToSend) {
			_this.log.debug("Send Nav to Telegram");
			const text = await checkStatusInfo(_this, part.text);

			sendToTelegram(_this, userToSend, text, part.nav, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part.parse_mode);
			return true;
		}
	}
}
module.exports = { sendNav };
