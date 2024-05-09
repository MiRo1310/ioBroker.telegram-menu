import G from "glob";

const { sendToTelegram } = require("./telegram.js");
const { decomposeText } = require("./global");
const { callSubMenu } = require("./subMenu.js");
const { sendNav } = require("./sendNav.js");
const { backMenuFunc } = require("./backMenu.js");

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
const bindingFunc = async (_this: any, id: string, text: string, userToSend: string, newline: boolean, telegramInstance: string, one_time_keyboard: boolean, resize_keyboard: boolean, userListWithChatID: UserListWithChatId[], parse_mode: ParseModeType) => {
	// Zusätzlicher Import da auf die Funktion sendToTelegram nicht  zugegriffen werden kann, die ausserhalb definiert wurde, keine Ahnung warum

	let value;

	try {
		const substring = decomposeText(text, "binding:", "}").substring;
		const arrayOfItems = substring.replace("binding:{", "").replace("}", "").split(";");
		const bindingObject: BindingObject = {
			values: {},
		};

		for (let item of arrayOfItems) {
			if (!item.includes("?")) {
				const key = item.split(":")[0];
				const id = item.split(":")[1];

				const result = await _this.getForeignStateAsync(id);
				bindingObject.values[key] = result.val;
			} else {
				Object.keys(bindingObject.values).forEach(function (key) {
					item = item.replace(key, bindingObject.values[key]);
				});

				value = eval(item);
			}
		}
		sendToTelegram(_this, userToSend, value, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
	} catch (error: any) {
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
function calcValue(_this: any, textToSend: string, val: string) {
	const startindex = textToSend.indexOf("{math");
	const endindex = textToSend.indexOf("}", startindex);
	const substring = textToSend.substring(startindex, endindex + 1);
	const mathValue = substring.replace("{math:", "").replace("}", "");
	try {
		val = eval(val + mathValue);
	} catch (e: any) {
		_this.log.error("Error Eval" + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
	textToSend = textToSend.replace(substring, "");
	return { textToSend: textToSend, val: val };
}

/**
 * Adds && to the line if not exists to display the buttons in one line
 * @param {string} text Text to convert to Navigation Arrays
 * @returns {string}
 */
function checkValueForOneLine(text: string) {
	if (!text.includes("&&")) return text + "&&";
	return text;
}

interface NewVal {
	value: string[] | string[][];
}
/**
 * Generate Array
 * @param {object[]} val
 * @param {*} _this
 * @returns  Arrays with Buttons
 */
async function editArrayButtons(val: EditArrayButtons[], _this: any) {
	try {
		val.forEach((element, key) => {
			let value = "";
			if (typeof element.value === "string") {
				value = checkValueForOneLine(element.value);
			}
			let array: string[] | string[][] = []
			if (value.indexOf("&&") != -1) array = value.split("&&");

			if (array.length > 1) {
				array.forEach(function (element, index: number) {
					if (typeof element === "string") {
						let navArray = element.split(",");
						navArray = navArray.map((item) => item.trim());
						array[index] = navArray;
					}
				});
			} else {
				if (typeof element.value === "string") {
					array = element.value.split(",");
					array.forEach(function (element, index: number) {
						array[index] = [element.trim()];
					});
				}
			}
			//REVIEW - Changed			
			val[key].value = array;
		});
		return val;
	} catch (err: any) {
		_this.log.error("Error EditArray: " + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}
// ID by Selector Auswerten
/**
 *
 * @param {*} _this
 * @param {string} selector Selector
 * @param {string} text Text to send
 * @param {string} userToSend User to send
 * @param {string} newline Newline
 */
const idBySelector = async (_this: any, selector: string, text: string, userToSend: string, newline: Newline, telegramInstance: string, one_time_keyboard: boolean, resize_keyboard: boolean, userListWithChatID: UserListWithChatId[]) => {
	let text2Send = "";
	try {
		if (selector.includes("functions")) {
			const functions = selector.replace("functions=", "");
			let enums = [];
			const result = await _this.getEnumsAsync();
			if (result && result["enum.functions"][`enum.functions.${functions}`]) {
				enums = result["enum.functions"][`enum.functions.${functions}`].common.members;
				if (enums) {
					const promises = enums.map(async (id: string) => {
						try {
							const value = await _this.getForeignStateAsync(id);
							if (value && value.val) {
								_this.log.debug("Value " + JSON.stringify(value.val));
								_this.log.debug("text " + JSON.stringify(text));
								let newText = text;
								let name;
								if (text.includes("{common.name}")) {

									name = await _this.getForeignObjectAsync(id);
									_this.log.debug("Name " + JSON.stringify(name));

									if (name && name.common.name) newText = newText.replace("{common.name}", name.common.name);
								}
								if (text.includes("&amp;&amp;")) text2Send += newText.replace("&amp;&amp;", value.val);
								else {
									text2Send += newText;
									text2Send += " " + value.val;
								}
							}
							if (newline == "true") text2Send += "\n";
							else text2Send += " ";
							_this.log.debug("text2send " + JSON.stringify(text2Send));
						} catch (e: any) {
							_this.log.error("Error Promise: " + JSON.stringify(e.message));
							_this.log.error(JSON.stringify(e.stack));
						}
					});
					Promise.all(promises)
						.then(() => {
							_this.log.debug("textToSend " + JSON.stringify(text2Send));
							_this.log.debug("userToSend " + JSON.stringify(userToSend));

							sendToTelegram(_this, userToSend, text, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, "");
						})
						.catch((e) => {
							_this.log.error("Error Promise: " + JSON.stringify(e.message));
							_this.log.error(JSON.stringify(e.stack));
						});
				}
			}
		}
	} catch (error: any) {
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
async function generateNewObjectStructure(_this: any, val: Nav[]) {
	try {
		const obj: { [key: string]: { nav: string, text: string, parse_mode: BooleanString } } = {};
		val.forEach(function (element) {
			const call = element.call;
			obj[call] = {
				nav: element.value,
				text: element.text,
				parse_mode: element.parse_mode == "true" || element.parse_mode == "false" ? element.parse_mode : "false",
			};
		});
		return obj;
	} catch (err: any) {
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
function generateActions(_this: any, action: Actions, userObject: UserObjectActions) {
	try {
		const arrayOfEntries: GenerateActionsArrayOfEntries[] = [
			{
				objName: "echarts",
				name: "echarts",
				loop: "preset",
				elements: [{ name: "preset" }, { name: "echartInstance" }, { name: "background" }, { name: "theme" }, { name: "filename" }],
			},
			{ objName: "loc", name: "location", loop: "latitude", elements: [{ name: "latitude" }, { name: "longitude" }, { name: "parse_mode", key: 0 }] },
			{ objName: "pic", name: "sendPic", loop: "IDs", elements: [{ name: "id", value: "IDs" }, { name: "fileName" }, { name: "delay", value: "picSendDelay" }] },
			{
				objName: "get",
				name: "getData",
				loop: "IDs",
				elements: [
					{ name: "id", value: "IDs" },
					{ name: "text", type: "text" },
					{ name: "newline", value: "newline_checkbox" },
					{ name: "parse_mode", key: 0 },
				],
			},
			{
				objName: "httpRequest",
				name: "httpRequest",
				loop: "url",
				elements: [{ name: "url" }, { name: "user" }, { name: "password" }, { name: "filename" }],
			},
		];

		_this.log.debug("action : " + JSON.stringify(action));
		const listOfSetStateIds: string[] = [];
		action.set.forEach(function (element, key) {

			if (key == 0) userObject[element.trigger] = { switch: [] };
			userObject[element.trigger] = { switch: [] };
			element.IDs.forEach(function (id: string, index: number) {
				// Liste zum überwachen der Ids
				listOfSetStateIds.push(id);
				const toggle = element.switch_checkbox[index] === "true";
				let value;
				// Aus true oder false einen boolean machen
				if (element.values[index] === "true" || element.values[index] === "false") {
					value = element.values[index] === "true";
				} else value = element.values[index];
				const newObj: Switch = {
					id: element.IDs[index],
					value: value,
					toggle: toggle,
					confirm: element.confirm[index],
					returnText: element.returnText[index],
					ack: element.ack ? element.ack[index] : false,
					parse_mode: element.parse_mode ? element.parse_mode[0] : false,
				};
				if (userObject[element.trigger]?.switch) {

					userObject[element.trigger].switch!.push(newObj);
				}
			});
		});

		arrayOfEntries.forEach((item) => {
			if (action[item.objName as keyof Actions]) {
				action[item.objName as keyof Actions].forEach(function (element, index: number) {
					userObject[element.trigger] = { [item.name]: [] };
					if (index == 0) userObject[element.trigger] = { [item.name as keyof UserObjectActions]: [] };

					element[item.loop].forEach(function (id: string, key: number) {
						const newObj: GenerateActionsNewObject = {};
						item.elements.forEach((elementItem) => {
							const name = elementItem.name;
							const value = elementItem.value ? elementItem.value : elementItem.name;
							const newKey = elementItem.key ? elementItem.key : key;
							let val: string | boolean;

							if (!element[value]) val = false;
							else val = element[value][newKey];
							if (val == undefined) val = "false";

							if (elementItem.type == "text" && typeof val === "string") newObj[name as keyof GenerateActionsNewObject] = val.replace(/&amp;/g, "&") as any;
							else newObj[name as keyof GenerateActionsNewObject] = val as any;
						});
						// @ts-ignore
						userObject[element.trigger][item?.name as keyof UserObjectActions].push(newObj);
					});
				});
			}
		});

		return { obj: userObject, ids: listOfSetStateIds };
	} catch (err: any) {
		_this.log.error("Error generateActions" + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}

function roundValue(_this: any, val: string, textToSend: string) {
	try {
		const floatedNumber = parseFloat(val);
		const result = decomposeText(textToSend, "{round:", "}");
		const substring = result.substring;
		const decimalPlaces = substring.split(":")[1].replace("}", "");
		const floatedString = floatedNumber.toFixed(parseInt(decimalPlaces));
		return { val: floatedString, textToSend: result.textWithoutSubstring };
	} catch (err: any) {
		_this.log.error("Error roundValue" + JSON.stringify(err.message));
		_this.log.error(JSON.stringify(err.stack));
	}
}

const insertValueInPosition = (textToSend: string, text: string) => {
	let searchString = "";
	if (textToSend.includes("&&")) searchString = "&&";
	else searchString = "&amp;&amp;";
	textToSend.toString().indexOf(searchString) != -1 ? (textToSend = textToSend.replace(searchString, text)) : (textToSend += " " + text);
	return textToSend;
};

const adjustValueType = (_this: any, value: string, valueType: ValueType) => {
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

const checkEvent = (dataObject: DataObject, id: string, state: ioBroker.State, menuData: MenuData, _this: any, userListWithChatID: UserListWithChatId[], instanceTelegram: string, resize_keyboard: boolean, one_time_keyboard: boolean, usersInGroup: UserInGroup) => {
	const menuArray: string[] = [];
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
				if (usersInGroup[menu] && menuData.data[menu][calledNav as keyof DataObject]) {
					usersInGroup[menu].forEach((user: string) => {
						const part = menuData.data[menu][calledNav as keyof DataObject];
						const menus = Object.keys(menuData.data);
						backMenuFunc(_this, calledNav, part.nav, user);

						if (part && JSON.stringify(part.nav[0]).includes("menu:")) {
							callSubMenu(
								_this,
								JSON.stringify(part.nav[0]),
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
						} else {
							sendNav(_this, part, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
						}
					});
				}
			});
		}
	}

	return ok;
};

module.exports = {
	editArrayButtons,
	idBySelector,
	generateNewObjectStructure,
	generateActions,
	calcValue,
	roundValue,
	bindingFunc,
	insertValueInPosition,
	adjustValueType,
	checkEvent,
};
