const { callSubMenu, backMenuFunc } = require("./subMenu.js");
const { checkStatusInfo } = require("./utilities.js");
const { sendToTelegram } = require("./telegram.js");

/**
 * Checks if sends a normal Navigation or a Submenu
 * @param {*} _this
 * @param {object} part Part of the Menu
 * @param {string} call Call
 * @param {string} userToSend User to send
 * @param {string} instanceTelegram Instance of Telegram
 * @param {boolean} resize_keyboard Resize Keyboard
 * @param {boolean} one_time_keyboard One Time Keyboard
 * @param {[]} userListWithChatID  Array with ChatID and Username
 * @param {{}} menuData Data of the Menu
 * @param {object} allMenusWithData All Menus with Data
 * @param {array} menus All Menus
 * @param {array|null} setStateIdsToListenTo State Ids to listen to
 * @returns true, if a Submenu is called
 */
async function sendNav(
	_this,
	part,
	call,
	userToSend,
	instanceTelegram,
	resize_keyboard,
	one_time_keyboard,
	userListWithChatID,
	menuData,
	allMenusWithData,
	menus,
	setStateIdsToListenTo,
) {
	_this.log.debug("Menu to Send: " + JSON.stringify(part.nav));
	backMenuFunc(_this, call, part.nav, userToSend);
	if (JSON.stringify(part.nav).includes("menu:")) {
		_this.log.debug("Submenu");
		callSubMenu(
			_this,
			JSON.stringify(part.nav),
			menuData,
			userToSend,
			instanceTelegram,
			resize_keyboard,
			one_time_keyboard,
			userListWithChatID,
			part,
			allMenusWithData,
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
