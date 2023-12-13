const changeValue = require("./utilities").changeValue;
const { sendToTelegram, sendToTelegramSubmenu } = require("./telegram");
const { bindingFunc, roundValue, calcValue, idBySelector, createKeyboardFromJson, createTextTableFromJson } = require("./action");
const { processTimeIdLc, processTimeValue } = require("./utilities");
const Utils = require("./global");

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
		const parse_mode = element.parse_mode;
		try {
			_this.log.debug("Get Value ID " + JSON.stringify(element.id));
			const specificatorSelektor = "functions=";
			const id = element.id;
			let textToSend = "";
			if (id.indexOf(specificatorSelektor) != -1) {
				idBySelector(_this, id, element.text, userToSend, element.newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID);
			} else if (element.text.includes("binding:")) {
				_this.log.debug("Binding");
				bindingFunc(_this, id, element.text, userToSend, element.newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
			} else {
				_this.getForeignStateAsync(id).then(async (value) => {
					const valueForJson = value.val;
					if (value) {
						_this.log.debug("Value " + JSON.stringify(value));
					}
					if (value) {
						let val = JSON.stringify(value.val);
						val = val.replace(/\\/g, "").replace(/"/g, "");

						_this.log.debug("Element.text " + JSON.stringify(element.text));
						let newline = "";
						if (element.newline === "true") {
							newline = "\n";
						}
						if (element.text) {
							textToSend = element.text.toString();
							if (element.text.includes("{time.lc") || element.text.includes("{time.ts")) {
								textToSend = await processTimeIdLc(element.text, id, _this);
								// value zurück setzen
								val = "";
							}
							if (textToSend.includes("{time}")) {
								textToSend = processTimeValue(textToSend, value);
								val = "";
							}
							if (textToSend.includes("math:")) {
								const result = calcValue(_this, textToSend, val);
								textToSend = result.textToSend;
								val = result.val;
								_this.log.debug(JSON.stringify({ textToSend: textToSend, val: val }));
							}
							if (textToSend.includes("round:")) {
								const result = roundValue(_this, val, textToSend);
								if (result) {
									_this.log.debug("The Value was rounded " + JSON.stringify(val) + " to " + JSON.stringify(result.val));
									val = result.val;
									textToSend = result.textToSend;
								}
							}
							if (textToSend.includes("{json")) {
								if (Utils.decomposeText(textToSend, "{json", "}").substring.includes("TextTable")) {
									const result = createTextTableFromJson(_this, valueForJson, textToSend);
									if (result) {
										sendToTelegram(_this, userToSend, result, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
										return;
									} else _this.log.debug("Cannot create a Text-Table");
								} else {
									const result = createKeyboardFromJson(_this, valueForJson, textToSend);
									if (valueForJson && valueForJson.length > 0) {
										if (result && result.text && result.keyboard)
											sendToTelegramSubmenu(_this, userToSend, result.text, result.keyboard, telegramInstance, userListWithChatID, parse_mode);
										return;
									} else {
										sendToTelegram(
											_this,
											userToSend,
											"The state is empty!",
											undefined,
											telegramInstance,
											one_time_keyboard,
											resize_keyboard,
											userListWithChatID,
											parse_mode,
										);
										_this.log.debug("The state is emty!");
										return;
									}
								}
							}

							const resultChange = changeValue(textToSend, val, _this);
							_this.log.debug("res " + JSON.stringify(resultChange));
							if (resultChange) {
								val = resultChange["val"];
								textToSend = resultChange["textToSend"];
							} else console.log("No Change");

							if (textToSend.indexOf("&&") != -1) text += `${textToSend.replace("&&", val)}${newline}`;
							else text += textToSend + " " + val + newline;
						} else text += `${val} ${newline}`;
						_this.log.debug("Text " + JSON.stringify(text));
					}
					_this.log.debug("Length & i: " + JSON.stringify({ length: part.getData.length, i: i }));
					if (i == part.getData.length) {
						_this.log.debug("User to send: " + JSON.stringify(userToSend));
						if (userToSend) sendToTelegram(_this, userToSend, text, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
					}
					i++;
				});
			}
		} catch (error) {
			_this.log.error("Error Getdata: " + JSON.stringify(error.message));
			_this.log.error(JSON.stringify(error.stack));
		}
	});
}

module.exports = { getstate };
