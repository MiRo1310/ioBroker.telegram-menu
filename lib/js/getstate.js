const sendToTelegram = require("./telegram").sendToTelegram;
const idBySelector = require("./action").idBySelector;
const exchangeValue = require("./action").exchangeValue;
const calcValue = require("./action").calcValue;

/**
 * 	Get the state of the id and send it to the user
 * @param {*} _this
 * @param {object} part Part of the Menu
 * @param {string} userToSend User to send the message to
 * @param {string} telegramInstance Instance to send the message to
 * @param {boolean} one_time_keyboard
 * @param {boolean} resize_keyboard
 * @param {object} userListWithChatID Userlist with ChatID
 */
function getstate(_this, part, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) {
	let text = "";
	let i = 1;
	part.getData.forEach(async (element) => {
		try {
			_this.log.debug("Get Value ID " + JSON.stringify(element.id));
			const specificatorSelektor = "functions=";
			const id = element.id;
			if (id.indexOf(specificatorSelektor) != -1) {
				// const selector = id.replace(/\"/g, "");
				idBySelector(
					_this,
					id,
					element.text,
					userToSend,
					element.newline,
					telegramInstance,
					one_time_keyboard,
					resize_keyboard,
					userListWithChatID,
				);
			} else {
				_this.getForeignStateAsync(element.id).then((value) => {
					if (value) {
						_this.log.debug("Value " + JSON.stringify(value));
					}
					if (value) {
						let val = JSON.stringify(value.val);
						_this.log.debug("Element.text " + JSON.stringify(element.text));
						let newline = "";
						if (element.newline === "true") {
							newline = "\n";
						}
						if (element.text) {
							let result = {};
							let textToSend = element.text.toString();
							if (textToSend.includes("{time}")) {
								const time = new Date(value.val);
								const timeString = time.toLocaleDateString("de-DE", {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
									hour12: false,
								});
								textToSend = textToSend.replace("{time}", timeString);
								val = "";
							}
							if (textToSend.includes("math:")) {
								const result = calcValue(_this, textToSend, val);
								textToSend = result.textToSend;
								val = result.val;
								_this.log.debug(JSON.stringify({ textToSend: textToSend, val: val }));
							}
							if (textToSend.includes("change{")) {
								result = exchangeValue(textToSend, val, _this);
								val = result["valueChange"];
								_this.log.debug("result " + JSON.stringify(result));
								textToSend = result["textToSend"];
							}

							if (textToSend.indexOf("&&") != -1) text += `${textToSend.replace("&&", val)}${newline}`;
							else text += textToSend + " " + val + newline;
						} else text += `${val} ${newline}`;
						_this.log.debug("Text " + JSON.stringify(text));
					}
					_this.log.debug("Length & i: " + JSON.stringify({ length: part.getData.length, i: i }));
					if (i == part.getData.length) {
						_this.log.debug("User to send: " + JSON.stringify(userToSend));
						if (userToSend)
							sendToTelegram(
								_this,
								userToSend,
								text,
								undefined,
								telegramInstance,
								one_time_keyboard,
								resize_keyboard,
								userListWithChatID,
							);
					}
					i++;
				});
			}
		} catch (error) {
			_this.log.error("Error Getdata: " + JSON.stringify(error.message));
		}
	});
}
async function checkStatusInfo(_this, text) {
	try {
		if (text.includes("{status:")) {
			_this.log.debug("CheckStatusInfo: " + JSON.stringify(text));
			const startindex = text.indexOf("{status:");
			const id = text.slice(startindex + 8, text.indexOf("}", startindex));
			const value = await _this.getForeignStateAsync(id);
			_this.log.debug("ID, Value " + JSON.stringify(id + " " + value));
			_this.log.debug("Status Value " + JSON.stringify(value.val));
			if ((value && value.val) || value.val === 0) {
				text = text.replace(text.slice(startindex, text.indexOf("}", startindex) + 1), value.val);
			} else _this.log.debug("Error getting Value from " + JSON.stringify(id));
			_this.log.debug("ID " + JSON.stringify(id));
		}
		return text;
	} catch (e) {
		_this.log.error("Error checkStatusInfo: " + JSON.stringify(e.message));
	}
}
module.exports = { getstate, checkStatusInfo };
