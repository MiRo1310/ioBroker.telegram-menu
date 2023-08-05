const sendToTelegram = require("./telegram").sendToTelegram;
/**
 *
 * @param {string} textToSend
 * @param {string} val
 */
function calcValue(_this, textToSend, val) {
	const startindex = textToSend.indexOf("{math");
	const endindex = textToSend.indexOf("}", startindex);
	const substring = textToSend.substring(startindex, endindex);
	const mathvalue = substring.replace("{math:", "").replace("}", "");
	try {
		val = eval(val + mathvalue);
	} catch (e) {
		_this.log.error("Error Eval" + JSON.stringify(e));
	}
	textToSend = textToSend.replace(substring, "");
	return { textToSend: textToSend, val: val };
}

/**
 *
 * @param {String} textToSend Text which should be send to user
 */
function exchangeValue(textToSend, stateVal, _this) {
	const startindex = textToSend.indexOf("change{");
	const match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));
	let objChangeValue;
	if (isJSON("{" + match + "}")) objChangeValue = JSON.parse("{" + match + "}");
	else {
		_this.log.error(`There is a error in your input: ` + JSON.stringify(match.replace(/"/g, "'")));
		return false;
	}
	return { valueChange: objChangeValue[String(stateVal)], textToSend: textToSend.substring(0, startindex) };
}
function isJSON(str) {
	try {
		JSON.parse(str);
		return true;
	} catch (error) {
		return false;
	}
}
/**
 * Generate Array
 * @param {*} val
 * @param {*} _this
 * @returns
 */
async function editArrayButtons(val, _this) {
	try {
		// _this.log.debug("Empfangen " + JSON.stringify(val));
		val.forEach((element, key) => {
			let array = [];
			// _this.log.debug("Element " + JSON.stringify(element));
			if (element.value.indexOf("&&") != -1) array = element.value.split("&&");

			if (array.length > 1) {
				array.forEach(function (element, key) {
					array[key] = element.split(",");
				});
			} else {
				array = element.value.split(",");
				array.forEach(function (element, key) {
					array[key] = [element];
				});
			}

			_this.log.debug("Array " + JSON.stringify(array));
			val[key].value = array;
		});
		return val;
	} catch (err) {
		console.log("Error EditArray: " + err);
	}
}
// ID by Selctor Auswerten
/**
 *
 * @param {*} _this
 * @param {string} selector
 * @param {*} text
 * @param {*} userToSend
 * @param {*} newline
 */
const idBySelector = async (_this, selector, text, userToSend, newline) => {
	let text2Send = "";
	try {
		if (selector.includes("functions")) {
			const functions = selector.replace("functions=", "");
			let enums = [];
			const result = await _this.getEnumsAsync();
			if (result && result["enum.functions"][`enum.functions.${functions}`]) {
				enums = result["enum.functions"][`enum.functions.${functions}`].common.members;
				if (enums) {
					const promises = enums.map(async (id) => {
						const value = await _this.getForeignStateAsync(id);
						if (value && value.val) {
							_this.log.debug("Value " + JSON.stringify(value.val));
							_this.log.debug("text " + JSON.stringify(text));
							let newtext = text;
							let name;
							if (text.includes("{common.name}")) {
								_this.log.debug("test ");
								name = await _this.getForeignObjectAsync(id);
								_this.log.debug("Name " + JSON.stringify(name));
								// _this.log.debug("Name " + JSON.stringify(await _this.getForeignObjectAsync(id)));
								if (name && name.common.name)
									newtext = newtext.replace("{common.name}", name.common.name);
							}
							if (text.includes("&amp;&amp;")) text2Send += newtext.replace("&amp;&amp;", value.val);
							else {
								text2Send += newtext;
								text2Send += " " + value.val;
							}
						}
						if (newline == "true" || newline == true) text2Send += "\n";
						else text2Send += " ";
						_this.log.debug("text2send " + JSON.stringify(text2Send));
					});
					Promise.all(promises)
						.then(() => {
							_this.log.debug("text2send " + JSON.stringify(text2Send));
							_this.log.debug("usertosend " + JSON.stringify(userToSend));

							sendToTelegram(_this, userToSend, text2Send);
						})
						.catch((e) => {
							_this.log.debug("Error " + JSON.stringify(e));
						});
				}
			}
		}
	} catch (error) {
		_this.log.debug("Error " + JSON.stringify(error));
	}
};

/**
 * Werte aus Datenpunkte an Telegramm senden
 * @param {string} user Username
 * @param {String} id ID des Datenpunkts
 * @param {string} textVorVal Text vor Value
 * @param {string} textNachVal Text nach Value
 */
const wertUebermitteln = async (_this, user, id, textVorVal, textNachVal) => {
	try {
		const value = await _this.getStateAsync(id);
		if (value && value.val && typeof value.val == "string") {
			sendToTelegram(this, user, `${textVorVal} ${value.val} ${textNachVal}`);
		}
	} catch (e) {
		_this.log.debug("Error " + JSON.stringify(e));
	}
};
/**
 *
 * @param {*} _this
 * @param {array} val
 */
async function generateNewObjectStructure(_this, val) {
	try {
		// _this.log.debug("Val to structure " + JSON.stringify(val));
		const obj = {};
		val.forEach(function (element) {
			const call = element.call;
			obj[call] = {
				nav: element.value,
				text: element.text,
			};
			_this.log.debug("elementVal " + JSON.stringify(element.value));
		});
		return obj;
	} catch (err) {
		console.log("Error GenerateNewObjectStructure " + err);
	}
}

/**
 *
 * @param {object} action Object with Actions
 * @param {*} userObject Object from User with generated Navigation
 */
function generateActions(_this, action, userObject) {
	try {
		_this.log.debug("action : " + JSON.stringify(action));
		const listOfSetStateIds = [];
		action.set.forEach(function (element, key) {
			if (key == 0) userObject[element.trigger] = { switch: [] };
			userObject[element.trigger] = { switch: [] };
			element.IDs.forEach(function (id, key) {
				// Liste zum überwachen der Ids
				listOfSetStateIds.push(id);
				const toggle = element.switch_checkbox[key] === "true";
				let value;
				// Aus true oder false einen boolean machen
				if (element.values[key] === "true" || element.values[key] === "false") {
					value = element.values[key] === "true";
				} else value = element.values[key];

				const newObj = {
					id: element.IDs[key],
					value: value,
					toggle: toggle,
					nav: element.nav,
					confirm: element.confirm[key],
					returnText: element.returnText[key],
				};
				_this.log.debug("Element set: " + JSON.stringify(element));
				_this.log.debug("Trigger: " + JSON.stringify(element.trigger));
				userObject[element.trigger].switch.push(newObj);
			});
		});
		_this.log.debug("Obj set: " + JSON.stringify(userObject));
		action.get.forEach(function (element, key) {
			userObject[element.trigger] = { getData: [] };
			if (key == 0) userObject[element.trigger] = { getData: [] };
			element.IDs.forEach(function (id, key) {
				const newObj = {
					id: element.IDs[key],
					text: element.text[key].replace(/&amp;/g, "&"),
					newline: element.newline_checkbox[key],
					nav: element.nav,
				};
				_this.log.debug("Element get: " + JSON.stringify(element));
				_this.log.debug("Trigger: " + JSON.stringify(element.trigger));
				userObject[element.trigger].getData.push(newObj);
			});
		});
		action.pic.forEach(function (element, key) {
			_this.log.debug("Pic ");
			userObject[element.trigger] = { sendPic: [] };
			if (key == 0) userObject[element.trigger] = { sendPic: [] };
			element.IDs.forEach(function (id, key) {
				const newObj = {
					id: element.IDs[key],
					delay: element.picSendDelay[key],
					fileName: element.fileName[key],
				};
				_this.log.debug("Element Pic: " + JSON.stringify(element));
				_this.log.debug("Trigger: " + JSON.stringify(element.trigger));
				userObject[element.trigger].sendPic.push(newObj);
			});
		});
		return { obj: userObject, ids: listOfSetStateIds };
	} catch (err) {
		console.log("Error generateActions: " + err);
	}
}

module.exports = {
	editArrayButtons,
	idBySelector,
	wertUebermitteln,
	generateNewObjectStructure,
	generateActions,
	exchangeValue,
	calcValue,
};
