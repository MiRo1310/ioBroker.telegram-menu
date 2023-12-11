const newLine = require("./utilities").newLine;
function checkDebugging() {
	// if (process.env.noDebugging === "true") {
	// 	return true;
	// } else {
	return false;
	// }
}

/**
 *
 * @param {*} _this this durchgereicht
 * @param {string} user Username
 * @param {string} textToSend Text
 * @param {array} keyboard Array of Buttons
 * @param {string} instance Telgram instance like telegram.0
 * @param {boolean} resize_keyboard
 * @param {boolean} one_time_keyboard
 */
function sendToTelegram(_this, user = "", textToSend, keyboard = [], instance = "telegram.0", resize_keyboard = true, one_time_keyboard = true, userListWithChatID, parse_mode) {
	try {
		_this.log.debug("Send this Value : " + JSON.stringify(textToSend));
		_this.log.debug("Send this to : " + JSON.stringify(user));
		_this.log.debug("Instance : " + JSON.stringify(instance));
		_this.log.debug("userListWithChatID	: " + JSON.stringify(userListWithChatID));

		parse_mode = getParceMode(parse_mode);
		const chatId = getChatID(userListWithChatID, user);
		console.log("parse_mode: " + parse_mode);
		console.log("chatId: " + chatId);
		console.log("textToSend: " + textToSend);
		textToSend = newLine(textToSend);
		if (keyboard.length == 0) {
			if (!checkDebugging()) {
				_this.sendTo(
					instance,
					"send",
					{
						text: textToSend,
						chatId: chatId,
						parse_mode: parse_mode,
					},
					function (res) {
						_this.log.debug("Sent Value to " + JSON.stringify(res) + " users!");
					},
				);
			}
		} else {
			if (!checkDebugging()) {
				_this.sendTo(
					instance,
					"send",
					{
						chatId: chatId,
						parse_mode: parse_mode,
						text: textToSend,
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
 * @param {string} textToSend Text to send
 * @param {*} keyboard
 * @param {*} instance
 * @param {*} userListWithChatID
 */
function sendToTelegramSubmenu(_this, user, textToSend, keyboard, instance = "telegram.0", userListWithChatID, parse_mode) {
	parse_mode = getParceMode(parse_mode);
	try {
		const chatId = getChatID(userListWithChatID, user);
		textToSend = newLine(textToSend);
		if (!checkDebugging()) {
			_this.sendTo(instance, "send", {
				chatId: chatId,
				parse_mode: parse_mode,
				text: textToSend,
				reply_markup: keyboard,
			});
		}
	} catch (e) {
		_this.log.error("Error sendToTelegramSubmenu: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
const sendLocationToTelegram = async (_this, user, data, instance, userListWithChatID) => {
	try {
		const chatId = getChatID(userListWithChatID, user);
		for (const element of data) {
			if (!(element.latitude || element.longitude)) continue;

			const latitude = await _this.getForeignStateAsync(element.latitude);
			const longitude = await _this.getForeignStateAsync(element.longitude);
			console.log("latitude: " + latitude.val + " longitude: " + longitude.val);
			_this.sendTo(instance, {
				chatId: chatId,
				latitude: latitude.val,
				longitude: longitude.val,
				disable_notification: true,
			});
		}
	} catch (e) {
		_this.log.error("Error sendLocationToTelegram: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
};
function getParceMode(val) {
	if (val === "true" || val === true) return "HTML";
	else return "Markdown";
}

const getChatID = (userListWithChatID, user) => {
	let chatId = "";
	userListWithChatID.forEach((element) => {
		if (element.name === user) chatId = element.chatID;
	});
	return chatId;
};

module.exports = {
	sendToTelegram,
	sendToTelegramSubmenu,
	sendLocationToTelegram,
};
