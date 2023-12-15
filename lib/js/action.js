const { sendToTelegram } = require("./telegram.js");
const { decomposeText } = require("./global");
const { subMenu } = require("./subMenu.js");
const { sendNav } = require("./sendNav.js");
const { _subscribeAndUnSubscribeForeignStatesAsync } = require("./subscribeStates.js");

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

	let value;

	try {
		const substring = decomposeText(text, "binding:", "}").substring;
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
			console.log(element);
			console.log(element.parse_mode[0]);
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
					// nav: element.nav,
					confirm: element.confirm[key],
					returnText: element.returnText[key],

					ack: element.ack ? element.ack[key] : false,
					parse_mode: element.parse_mode ? element.parse_mode[0] : false,
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
					parse_mode: element.parse_mode ? element.parse_mode[0] : false,
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
		const result = decomposeText(textToSend, "{round:", "}");
		const substring = result.substring;
		const decimalPlaces = substring.split(":")[1].replace("}", "");
		val = val.toFixed(parseInt(decimalPlaces));
		return { val: val, textToSend: result.textWithoutSubstring };
	} catch (err) {
		_this.log.error("Error roundValue" + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}

const insertValueInPosition = (textToSend, value) => {
	let searchString = "";
	if (textToSend.includes("&&")) searchString = "&&";
	else searchString = "&amp;&amp;";
	textToSend.toString().indexOf(searchString) != -1 ? (textToSend = textToSend.replace(searchString, value)) : (textToSend += " " + value);
	return textToSend;
};

const createKeyboardFromJson = (_this, val, text) => {
	try {
		const array = decomposeText(text, "{json:", "}").substring.split(";");
		const headline = array[2];
		const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
		const valArray = JSON.parse(val);
		const keyboard = [];

		valArray.forEach((element, index) => {
			const firstRow = [];
			const rowArray = [];
			itemArray.forEach((item) => {
				if (index == 0) {
					firstRow.push({ text: item.split(":")[1], callback_data: "1" });
				}
				rowArray.push({ text: element[item.split(":")[0]], callback_data: "1" });
			});
			if (index == 0) keyboard.push(firstRow);
			keyboard.push(rowArray);
		});
		const inline_keyboard = { inline_keyboard: keyboard };
		_this.log.debug("keyboard: " + JSON.stringify(inline_keyboard));

		return { text: headline, keyboard: inline_keyboard };
	} catch (err) {
		_this.log.error("Error createKeyboardFromJson: " + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
};
/**
 *
 * @param {*} _this
 * @param {string} val Value From State
 * @param {*} textToSend Return Text
 * @returns Object with Text
 */
function createTextTableFromJson(_this, val, textToSend) {
	try {
		if (!val) return;
		const substring = decomposeText(textToSend, "{json:", "}").substring;
		const array = substring.split(";");
		const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
		const valArray = JSON.parse(val);
		const lengthArray = [];
		// Trägt für jedes Item einen Eintrag im lengthArray ein
		itemArray.forEach(() => {
			lengthArray.push(0);
		});
		valArray.forEach((element) => {
			itemArray.forEach((item, index) => {
				if (lengthArray[index] < element[item.split(":")[0]].length) lengthArray[index] = element[item.split(":")[0]].length;
			});
		});

		const headline = array[2];
		let textTable = textToSend.replace(substring, "").trim();
		if (textTable != "") textTable += " \n\n";
		textTable += " " + headline + " \n`";
		const enlargeColumn = 1;
		const reduce = lengthArray.length == 1 ? 2 : 0;
		const lineLenght = lengthArray.reduce((a, b) => a + b, 0) + 5 - reduce + enlargeColumn * lengthArray.length;
		// Breakline
		textTable += "-".repeat(lineLenght) + " \n";
		valArray.forEach((element, elementIndex) => {
			itemArray.forEach((item, index) => {
				// TableHead
				if (elementIndex == 0 && index == 0) {
					textTable += "|";
					itemArray.forEach((item2, i) => {
						textTable += " " + item2.split(":")[1].padEnd(lengthArray[i] + enlargeColumn, " ") + "|";
						if (i == itemArray.length - 1) {
							textTable += "\n";
							// Breakline
							textTable += "-".repeat(lineLenght) + " \n";
						}
					});
				}
				// TableBody
				if (index == 0) textTable += "|";
				textTable += " " + element[item.split(":")[0]].padEnd(lengthArray[index] + enlargeColumn, " ") + "|";
				if (index == itemArray.length - 1) textTable += "\n";
			});
		});
		// Breakline
		textTable += "-".repeat(lineLenght);
		textTable += "`";
		return textTable;
	} catch (err) {
		_this.log.error("Error createTextTableFromJson: " + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}

const adjustValueType = (_this, value, valueType) => {
	if (valueType == "number") {
		if (!parseFloat(value)) {
			_this.log.error(`Error: Value is not a number, value: ${value}`);
			return false;
		} else return parseFloat(value);
	} else if (valueType == "boolean") {
		if (value == "true") return true;
		else if (value == "false") return false;
		else {
			_this.log.error(`Error: Value is not a boolean, value: ${value}`);
			return false;
		}
	} else return value;
};

const checkEvent = (dataObject, id, state, menuData, _this, userListWithChatID, instanceTelegram, resize_keyboard, one_time_keyboard, usersInGroup) => {
	const menuArray = [];
	let ok = false;
	let calledNav = "";
	Object.keys(dataObject.action).forEach((menu) => {
		if (dataObject.action[menu] && dataObject.action[menu]["events"]) {
			dataObject.action[menu]["events"].forEach((event) => {
				if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
					if ((state.val == true || state.val == "true") && event.condition == "true") {
						ok = true;
						menuArray.push(menu);
						calledNav = event.menu[0];
					} else if ((state.val == false || state.val == "false") && event.condition[0] == "false") {
						ok = true;
						menuArray.push(menu);
						calledNav = event.menu[0];
					} else if (typeof state.val == "number" && state.val == parseInt(event.condition[0])) {
						ok = true;
						menuArray.push(menu);
						calledNav = event.menu[0];
					} else if (state.val == event.condition[0]) {
						ok = true;
						menuArray.push(menu);
						calledNav = event.menu[0];
					}
				}
			});
		}
	});
	if (ok) {
		if (menuArray.length >= 1) {
			menuArray.forEach((menu) => {
				if (usersInGroup[menu] && menuData.data[menu][calledNav]) {
					usersInGroup[menu].forEach((user) => {
						const part = menuData.data[menu][calledNav];
						const menus = Object.keys(menuData.data);
						const value = [""];
						if (value && value.includes("menu:")) {
							callSubMenu(
								_this,
								value,
								menuData.data[menu],
								user,
								instanceTelegram,
								resize_keyboard,
								one_time_keyboard,
								userListWithChatID,
								part,
								menuData.data,
								menus,
								null,
							);
						} else if (value) {
							sendNav(
								_this,
								part,
								calledNav,
								user,
								instanceTelegram,
								resize_keyboard,
								one_time_keyboard,
								userListWithChatID,
								menuData.data[menu],
								menuData,
								menus,
								null,
							);
						}
					});
				}
			});
		}
	}

	return ok;
};

/**
 *
 * @param {*} _this
 * @param {*} calledValue
 * @param {{}} groupData
 * @param {string} userToSend
 */
async function callSubMenu(
	_this,
	calledValue,
	groupData,
	userToSend,
	instanceTelegram,
	resize_keyboard,
	one_time_keyboard,
	userListWithChatID,
	part,
	menuData,
	menus,
	setStateIdsToListenTo,
) {
	try {
		const subMenuData = await subMenu(
			_this,
			calledValue,
			groupData,
			userToSend,
			instanceTelegram,
			resize_keyboard,
			one_time_keyboard,
			userListWithChatID,
			part,
			menuData,
			menus,
		);
		_this.log.debug("Submenu data " + JSON.stringify(subMenuData));

		if (subMenuData && subMenuData[3]) {
			_this.log.debug("SubmenuData3" + JSON.stringify(subMenuData[3]));
			if (subMenuData[3]) setStateIdsToListenTo = subMenuData[3];
			if (setStateIdsToListenTo) _subscribeAndUnSubscribeForeignStatesAsync(setStateIdsToListenTo, _this, true);
		}
		if (subMenuData && typeof subMenuData[0] == "string") {
			return { texttosend: subMenuData[0], keyboard: subMenuData[1] };
		}
	} catch (e) {
		_this.log.error("Error callSubMenu: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}

module.exports = {
	editArrayButtons,
	idBySelector,
	generateNewObjectStructure,
	generateActions,
	calcValue,
	roundValue,
	bindingFunc,
	insertValueInPosition,
	createKeyboardFromJson,
	createTextTableFromJson,
	adjustValueType,
	checkEvent,
	callSubMenu,
};
