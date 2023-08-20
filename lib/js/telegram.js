/**
 *
 * @param {*} _this this durchgereicht
 * @param {string} user Username
 * @param {string} value Text
 * @param {array} keyboard Array of Buttons
 * @param {string} instance Telgram instance like telegram.0
 * @param {boolean} resize_keyboard
 * @param {boolean} one_time_keyboard
 */
function sendToTelegram(
	_this,
	user = "",
	value,
	keyboard = [],
	instance = "telegram.0",
	resize_keyboard = true,
	one_time_keyboard = true,
	userListWithChatID,
) {
	_this.log.debug("Send this Value : " + JSON.stringify(value));
	_this.log.debug("Send this to : " + JSON.stringify(user));
	_this.log.debug("Instance : " + JSON.stringify(instance));
	let chatId = "";
	userListWithChatID.forEach((element) => {
		if (element.name === user) chatId = element.chatID;
	});
	if (keyboard.length == 0) {
		_this.sendTo(
			instance,
			"send",
			{
				text: value,
				chatId: chatId,
			},
			function (res) {
				console.log("Sent Value to " + res + " users!");
			},
		);
	} else {
		_this.sendTo(
			instance,
			"send",
			{
				chatId: chatId,
				text: value,
				reply_markup: {
					keyboard: keyboard,
					resize_keyboard: resize_keyboard,
					one_time_keyboard: one_time_keyboard,
				},
			},
			function (res) {
				console.log("Sent to " + res + " users");
			},
		);
	}
}
function sendToTelegramSubmenu(_this, user, text, keyboard, instance = "telegram.0", userListWithChatID) {
	let chatId = "";
	userListWithChatID.forEach((element) => {
		if (element.name === user) chatId = element.chatID;
	});
	_this.sendTo(instance, "send", {
		chatId: chatId,
		// name: user,
		text: text,
		reply_markup: keyboard,
	});
}

module.exports = {
	sendToTelegram,
	sendToTelegramSubmenu,
};
