const sendToTelegram = require("./telegram").sendToTelegram;
const Utils = require("./global");
/**
 * Calculates Value with the Value in {math:} from textToSend
 * @param {string} textToSend Text to send to user
 * @param {string} val Value to calculate with
 * @returns {object} textToSend and val
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
 * Exchange Value with other Value
 * @param {String} textToSend Text which should be send to user
 * @param {String} stateVal Value to exchange
 * @param {*} _this
 * @returns {object} valueChange and textToSend
 */
function exchangeValue(textToSend, stateVal, _this) {
	const startindex = textToSend.indexOf("change{");
	const match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));
	let objChangeValue;
	if (Utils.isJSON("{" + match + "}")) objChangeValue = JSON.parse("{" + match + "}");
	else {
		_this.log.error(`There is a error in your input: ` + JSON.stringify(Utils.replaceAll(match, '"', "'")));
		return false;
	}
	return { valueChange: objChangeValue[String(stateVal)], textToSend: textToSend.substring(0, startindex) };
}

/**
 * Generate Array
 * @param {object[]} val
 * @param {*} _this
 * @returns  Arrays with Buttons
 */
async function editArrayButtons(val, _this) {
	try {
		val.forEach((element, key) => {
			let array = [];
			if (element.value.indexOf("&&") != -1) array = element.value.split("&&");

			if (array.length > 1) {
				array.forEach(function (element, key) {
					let navArray = element.split(",");
					navArray = navArray.map((item) => item.trim());
					array[key] = navArray;
				});
			} else {
				array = element.value.split(",");
				array.forEach(function (element, key) {
					array[key] = [element.trim()];
				});
			}
			val[key].value = array;
		});
		return val;
	} catch (err) {
		_this.log.error("Error EditArray: " + err);
	}
}
// ID by Selctor Auswerten
/**
 *
 * @param {*} _this
 * @param {string} selector Selector
 * @param {string} text Text to send
 * @param {string} userToSend User to send
 * @param {string} newline Newline
 */
const idBySelector = async (
	_this,
	selector,
	text,
	userToSend,
	newline,
	telegramInstance,
	one_time_keyboard,
	resize_keyboard,
	userListWithChatID,
) => {
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
						if (newline == "true") text2Send += "\n";
						else text2Send += " ";
						_this.log.debug("text2send " + JSON.stringify(text2Send));
					});
					Promise.all(promises)
						.then(() => {
							_this.log.debug("text2send " + JSON.stringify(text2Send));
							_this.log.debug("usertosend " + JSON.stringify(userToSend));

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
						})
						.catch((e) => {
							_this.log.debug("Error " + JSON.stringify(e));
						});
				}
			}
		}
	} catch (error) {
		_this.log.error("Error " + JSON.stringify(error));
	}
};

/**
 *
 * @param {*} _this
 * @param {array} val Array with Objects
 * @returns Object with new Structure
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
		});
		return obj;
	} catch (err) {
		_this.log.error("Error GenerateNewObjectStructure " + err);
	}
}

/**
 *	Generate Actions
 * @param {object} action Object with Actions
 * @param {object} userObject Object from User with generated Navigation
 * @returns {object} Object with Actions and IDs
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
				userObject[element.trigger].getData.push(newObj);
			});
		});
		action.pic.forEach(function (element, key) {
			userObject[element.trigger] = { sendPic: [] };
			if (key == 0) userObject[element.trigger] = { sendPic: [] };
			element.IDs.forEach(function (id, key) {
				const newObj = {
					id: element.IDs[key],
					delay: element.picSendDelay[key],
					fileName: element.fileName[key],
				};
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
	generateNewObjectStructure,
	generateActions,
	exchangeValue,
	calcValue,
};
