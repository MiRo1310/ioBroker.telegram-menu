/**
 *
 * @param {*} user
 * @param {*} value
 * @param {*} keyboard
 */
function sendToTelegram(_this, user = "", value, keyboard = []) {
	_this.log.debug("Send this Value : " + JSON.stringify(value));
	if (keyboard.length == 0) {
		_this.sendTo(
			"telegram.0",
			"send",
			{
				text: value,
				user: user,
			},
			function (res) {
				console.log("Sent to " + res + " users!");
			},
		);
	} else {
		_this.sendTo(
			"telegram.0",
			"send",
			{
				text: value,
				reply_markup: {
					keyboard: keyboard,
					resize_keyboard: true,
					one_time_keyboard: false,
					user: user,
				},
			},
			function (res) {
				console.log("Sent to " + res + " users");
			},
		);
	}
}

module.exports = {
	sendToTelegram,
};
