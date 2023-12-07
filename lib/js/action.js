const { sendToTelegram } = require("./telegram.js");
const Utils = require("./global");
/**
 *
 * @param {*} _this
 * @param {*} id
 * @param {*} text
 * @param {*} userToSend
 * @param {*} newline
 * @param {*} telegramInstance
 * @param {*} one_time_keyboard
 * @param {*} resize_keyboard
 * @param {*} userListWithChatID
 * @param {*} parse_mode
 */
const bindingFunc = async (_this, id, text, userToSend, newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode) => {
	// Zusätzlicher Import da auf die Funktion sendToTelegram nicht  zugegriffen werden kann, die ausserhalb definiert wurde, keine Ahnung warum
	const { sendToTelegram } = require("./telegram");
	let value;

	try {
		const substring = Utils.decomposeText(text, "binding:", "}").substring;
		const arrayOfItems = substring.replace("binding:{", "").replace("}", "").split(";");
		const bindingObject = {
			values: [],
		};

		for (let item of arrayOfItems) {
			if (!item.includes("?")) {
				const key = item.split(":")[0];
				const id = item.split(":")[1];
				console.log("id " + id);
				const result = await _this.getForeignStateAsync(id);
				bindingObject.values[key] = result.val;
			} else {
				console.log(bindingObject.values);
				console.log(item);
				Object.keys(bindingObject.values).forEach(function (key) {
					console.log(key);
					console.log(bindingObject.values[key]);
					item = item.replace(key, bindingObject.values[key]);
				});
				console.log(item);
				value = eval(item);
				console.log(value);
			}
		}
		sendToTelegram(_this, userToSend, value, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
	} catch (error) {
		_this.log.error("Error " + JSON.stringify(error.message));
		_this.log.error(JSON.stringify(error.stack));
	}
};

/**
 * Calculates Value with the Value in {math:} from textToSend
 * @param {string} textToSend Text to send to user
 * @param {string} val Value to calculate with
 * @returns {object} textToSend and val
 */
function calcValue(_this, textToSend, val) {
	const startindex = textToSend.indexOf("{math");
	const endindex = textToSend.indexOf("}", startindex);
	const substring = textToSend.substring(startindex, endindex + 1);
	const mathvalue = substring.replace("{math:", "").replace("}", "");
	try {
		val = eval(val + mathvalue);
	} catch (e) {
		_this.log.error("Error Eval" + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
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
	let match = textToSend.substring(startindex + "change".length + 1, textToSend.indexOf("}", startindex));
	let objChangeValue;
	match = match.replaceAll("'", '"');
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
		_this.log.error("Error EditArray: " + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
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
const idBySelector = async (_this, selector, text, userToSend, newline, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID) => {
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
						try {
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
									if (name && name.common.name) newtext = newtext.replace("{common.name}", name.common.name);
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
						} catch (e) {
							_this.log.error("Error Promise: " + JSON.stringify(e.message));
							_this.log.error(JSON.stringify(e.stack));
						}
					});
					Promise.all(promises)
						.then(() => {
							_this.log.debug("text2send " + JSON.stringify(text2Send));
							_this.log.debug("usertosend " + JSON.stringify(userToSend));

							sendToTelegram(_this, userToSend, text, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, "");
						})
						.catch((e) => {
							_this.log.error("Error Promise: " + JSON.stringify(e.message));
							_this.log.error(JSON.stringify(e.stack));
						});
				}
			}
		}
	} catch (error) {
		_this.log.error("Error " + JSON.stringify(error.message));
		_this.log.error(JSON.stringify(error.stack));
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
				parse_mode: element.parse_mode,
			};
		});
		return obj;
	} catch (err) {
		_this.log.error("Error GenerateNewObjectStructure " + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
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
				// console.log(element);
				const newObj = {
					id: element.IDs[key],
					value: value,
					toggle: toggle,
					// nav: element.nav,
					confirm: element.confirm[key],
					returnText: element.returnText[key],
					ack: element.ack[key],
					parse_mode: element.parse_mode[0],
				};
				// console.log("set");
				// console.log(newObj);
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
					parse_mode: element.parse_mode[0],
					// nav: element.nav,
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
		if (action.loc) {
			action.loc.forEach(function (element, key) {
				userObject[element.trigger] = { location: [] };
				if (key == 0) userObject[element.trigger] = { location: [] };
				element.latitude.forEach(function (id, key) {
					const newObj = {
						latitude: element.latitude[key],
						longitude: element.longitude[key],
						parse_mode: element.parse_mode[0],
					};
					userObject[element.trigger].location.push(newObj);
				});
			});
		}
		return { obj: userObject, ids: listOfSetStateIds };
	} catch (err) {
		_this.log.error("Error generateActions" + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}

function roundValue(_this, val, textToSend) {
	try {
		val = parseFloat(val);
		const result = Utils.decomposeText(textToSend, "{round:", "}");
		const substring = result.substring;
		const decimalPlaces = substring.split(":")[1].replace("}", "");
		val = val.toFixed(parseInt(decimalPlaces));
		return { val: val, textToSend: result.textWithoutSubstring };
	} catch (err) {
		_this.log.error("Error roundValue" + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}
/**
 *
 * @param {string} textToSend
 * @param {*} obj
 * @returns String
 */
const processTimeValue = (textToSend, obj) => {
	const time = new Date(obj.val);
	const timeString = time.toLocaleDateString("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	textToSend = textToSend.replace("{time}", timeString);
	return textToSend;
};

/**
 *
 * @param {*} textToSend
 * @returns string
 */
const processTimeIdLc = async (textToSend, id, _this) => {
	// {time.ts,(DD MM YYYY hh:mm:ss:sss),(id:system.adapter.admin.0.memRss)}
	let key;
	const substring = Utils.decomposeText(textToSend, "{time.", "}").substring;
	const array = substring.split(",");
	textToSend = textToSend.replace(array[0], "");

	if (array[0].includes("lc")) key = "lc";
	else if (array[0].includes("ts")) key = "ts";

	if (!id) {
		if (!textToSend.includes("id:")) return _this.log.error("Error processTimeIdLc: id not found in " + JSON.stringify(textToSend));
		else {
			if (array[2]) {
				id = array[2].replace("id:", "").replace("}", "").replace(/'/g, "");
				textToSend = textToSend.replace(array[2], "").replace(/,/g, "");
			}
		}
	}
	const value = await _this.getForeignStateAsync(id);
	let timeValue;
	let timeStringUser;
	if (key) {
		timeStringUser = textToSend.replace(",(", "").replace(")", "").replace("}", "");
		timeValue = value[key];
	}

	const timeObj = new Date(timeValue);
	const milliceconds = timeObj.getMilliseconds();
	const seconds = timeObj.getSeconds();
	const minutes = timeObj.getMinutes();
	const hours = timeObj.getHours();
	const day = timeObj.getDate();
	const month = timeObj.getMonth() + 1;
	const year = timeObj.getFullYear();

	// Fügt eine führende Null hinzu, wenn die Stunden oder Minuten weniger als 10 sind
	const time = {
		ms: milliceconds < 10 ? "00" + milliceconds : milliceconds < 100 ? "0" + milliceconds : milliceconds,
		s: seconds < 10 ? "0" + seconds : seconds,
		m: minutes < 10 ? "0" + minutes : minutes,
		h: hours < 10 ? "0" + hours : hours,
		d: day < 10 ? "0" + day : day,
		mo: month < 10 ? "0" + month : month,
		y: year,
	};

	if (timeStringUser.includes("sss")) timeStringUser = timeStringUser.replace("sss", time.ms.toString());
	if (timeStringUser.includes("ss")) timeStringUser = timeStringUser.replace("ss", time.s.toString());
	if (timeStringUser.includes("mm")) timeStringUser = timeStringUser.replace("mm", time.m.toString());
	if (timeStringUser.includes("hh")) timeStringUser = timeStringUser.replace("hh", time.h.toString());
	if (timeStringUser.includes("DD")) timeStringUser = timeStringUser.replace("DD", time.d.toString());
	if (timeStringUser.includes("MM")) timeStringUser = timeStringUser.replace("MM", time.mo.toString());
	if (timeStringUser.includes("YYYY")) timeStringUser = timeStringUser.replace("YYYY", time.y.toString());
	if (timeStringUser.includes("YY")) timeStringUser = timeStringUser.replace("YY", time.y.toString().slice(-2));
	timeStringUser = timeStringUser.replace("(", "").replace(")", "");
	return timeStringUser;
};

module.exports = {
	processTimeIdLc,
	processTimeValue,
	editArrayButtons,
	idBySelector,
	generateNewObjectStructure,
	generateActions,
	exchangeValue,
	calcValue,
	roundValue,
	bindingFunc,
};
