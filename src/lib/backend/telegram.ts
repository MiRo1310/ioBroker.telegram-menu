const { newLine, getChatID } = require("./utilities");
const { checkStatusInfo } = require("./utilities");

/**
 *	Sends Message to Telegram, normal or with Keyboard
 * @param {*} _this this durchgereicht
 * @param {string} user Username
 * @param {string} textToSend Text
 * @param {array} keyboard Array of Buttons
 * @param {string} instance Telgram instance like telegram.0
 * @param {boolean} resize_keyboard Resize Keyboard
 * @param {boolean} one_time_keyboard One Time Keyboard
 * @param {*} userListWithChatID Array with ChatID and Username
 * @param {string} parse_mode Parse Mode HTML or Markdown
 */
async function sendToTelegram(
	_this: any,
	user = "",
	textToSend: string,
	keyboard = [],
	instance = "telegram.0",
	resize_keyboard = true,
	one_time_keyboard = true,
	userListWithChatID: UserListWithChatId,
	parse_mode: BooleanString,
) {
	try {
		const chatId = getChatID(userListWithChatID, user);
		_this.log.debug("Send this Value : " + JSON.stringify(textToSend));
		_this.log.debug("Send this to : " + JSON.stringify(user));
		_this.log.debug("Instance : " + JSON.stringify(instance));
		_this.log.debug("userListWithChatID	: " + JSON.stringify(userListWithChatID));
		_this.log.debug("parse_mode	: " + JSON.stringify(parse_mode));
		_this.log.debug("chatId	: " + JSON.stringify(chatId));

		const parse_modeType: ParseModeType = getParseMode(parse_mode);

		textToSend = newLine(textToSend);
		if (keyboard.length == 0) {
			_this.sendTo(
				instance,
				"send",
				{
					text: textToSend,
					chatId: chatId,
					parse_mode: parse_modeType,
				},
				function (res: any) {
					_this.log.debug("Sent Value to " + JSON.stringify(res) + " users!");
				},
			);
		} else {
			const text = await checkStatusInfo(_this, textToSend);
			_this.sendTo(
				instance,
				"send",
				{
					chatId: chatId,
					parse_mode: parse_mode,
					text: text,
					reply_markup: {
						keyboard: keyboard,
						resize_keyboard: resize_keyboard,
						one_time_keyboard: one_time_keyboard,
					},
				},
				function (res: any) {
					_this.log.debug("Sent Value to " + JSON.stringify(res) + " users!");
				},
			);
		}
	} catch (e: any) {
		_this.log.error("Error sendToTelegram: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
/**
 *
 * @param {*} _this
 * @param {string} user Username
 * @param {string} textToSend Text to send
 * @param {{}} keyboard Array of Buttons
 * @param {string} instance Telgram instance like telegram.0
 * @param {array} userListWithChatID Array with ChatID and Username
 */
function sendToTelegramSubmenu(_this: any, user: string, textToSend: string, keyboard: [], instance = "telegram.0", userListWithChatID: UserListWithChatId, parse_mode: BooleanString) {
	const parseModeType = getParseMode(parse_mode);
	try {
		const chatId = getChatID(userListWithChatID, user);
		textToSend = newLine(textToSend);
		_this.sendTo(instance, "send", {
			chatId: chatId,
			parse_mode: parseModeType,
			text: textToSend,
			reply_markup: keyboard,
		});
	} catch (e: any) {
		_this.log.error("Error sendToTelegramSubmenu: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}

/**
 * Sends Location to Telegram
 * @param {*} _this
 * @param {string} user  Username
 * @param {array} data Array with Objects with latitude and longitude
 * @param {string} instance Instance of Telegram
 * @param {array} userListWithChatID Array with ChatID and Username
 */
const sendLocationToTelegram = async (_this: any, user: string, data: any, instance: string, userListWithChatID: UserListWithChatId) => {
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
	} catch (e: any) {
		_this.log.error("Error sendLocationToTelegram: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
};

/**
 * Gets the Parse Mode for Telegram HTML or Markdown
 * @param {string|boolean} val Value
 * @returns {string} Markdown or HTML
 */
function getParseMode(val: "true" | "false" | boolean) {
	if (val === "true" || val === true) return "HTML";
	else return "Markdown";
}

module.exports = {
	sendToTelegram,
	sendToTelegramSubmenu,
	sendLocationToTelegram,
};
