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
let noDebugging = true;
if (process.env.noDebugging === "true") {
	console.log("Der Debugger ist aktiviert.");
	noDebugging = false;
} else {
	console.log("Der Debugger ist nicht aktiviert.");
}
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
	try {
		_this.log.debug("Send this Value : " + JSON.stringify(value));
		_this.log.debug("Send this to : " + JSON.stringify(user));
		_this.log.debug("Instance : " + JSON.stringify(instance));
		_this.log.debug("userListWithChatID	: " + JSON.stringify(userListWithChatID));
		let chatId = "";
		userListWithChatID.forEach((element) => {
			if (element.name === user) chatId = element.chatID;
		});

		if (keyboard.length == 0) {
			if (noDebugging) {
				_this.sendTo(
					instance,
					"send",
					{
						text: value,
						chatId: chatId,
					},
					function (res) {
						_this.log.debug("Sent Value to " + JSON.stringify(res) + " users!");
					},
				);
			}
		} else {
			if (noDebugging) {
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
						_this.log.debug("Sent Value to " + JSON.stringify(res) + " users!");
					},
				);
			}
		}
	} catch (e) {
		_this.log.error("Error sendToTelegram: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
/**
 *
 * @param {*} _this
 * @param {string} user Username
 * @param {string} text Text to send
 * @param {*} keyboard
 * @param {*} instance
 * @param {*} userListWithChatID
 */
function sendToTelegramSubmenu(_this, user, text, keyboard, instance = "telegram.0", userListWithChatID) {
	try {
		let chatId = "";
		userListWithChatID.forEach((element) => {
			if (element.name === user) chatId = element.chatID;
		});
		if (noDebugging) {
			_this.sendTo(instance, "send", {
				chatId: chatId,
				// name: user,
				text: text,
				reply_markup: keyboard,
			});
		}
	} catch (e) {
		_this.log.error("Error sendToTelegramSubmenu: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}

module.exports = {
	sendToTelegram,
	sendToTelegramSubmenu,
};
