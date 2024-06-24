import { sendToTelegram } from "./telegram.js";
import { decomposeText } from "./global";
import { callSubMenu } from "./subMenu.js";
import { sendNav } from "./sendNav.js";
import { backMenuFunc } from "./backMenu.js";
import { debug, error } from "./logging.js";
import TelegramMenu from "../../main";

const bindingFunc = async (
	text: string,
	userToSend: string,
	telegramInstance: string,
	one_time_keyboard: boolean,
	resize_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
	parse_mode: BooleanString,
): Promise<void> => {
	const _this = TelegramMenu.getInstance();
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
				if (result) {
					bindingObject.values[key] = result.val?.toString() || "";
				}
			} else {
				Object.keys(bindingObject.values).forEach(function (key) {
					item = item.replace(key, bindingObject.values[key]);
				});

				value = eval(item);
			}
		}
		sendToTelegram(userToSend, value, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, parse_mode);
	} catch (e: any) {
		error([
			{ text: "Error:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
};

function calcValue(_this: any, textToSend: string, val: string): { textToSend: string; val: string } | undefined {
	const { substring } = decomposeText(textToSend, "{math:", "}");
	const mathValue = substring.replace("{math:", "").replace("}", "");
	try {
		val = eval(val + mathValue);
		textToSend = textToSend.replace(substring, "");

		return { textToSend: textToSend, val: val };
	} catch (e: any) {
		error([
			{ text: "Error Eval:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
}

function checkValueForOneLine(text: string): string {
	if (!text.includes("&&")) {
		return text + "&&";
	}
	return text;
}

async function editArrayButtons(val: EditArrayButtons[], _this: any): Promise<GeneratedNavMenu[] | null> {
	const newVal: GeneratedNavMenu[] = [];
	try {
		val.forEach((element) => {
			let value = "";
			if (typeof element.value === "string") {
				value = checkValueForOneLine(element.value);
			}
			let array: string[] | string[][] = [];
			if (value.indexOf("&&") != -1) {
				array = value.split("&&");
			}

			if (array.length > 1) {
				array.forEach(function (element, index: number) {
					if (typeof element === "string") {
						let navArray = element.split(",");
						navArray = navArray.map((item) => item.trim());
						array[index] = navArray;
					}
				});
			} else if (typeof element.value === "string") {
				array = element.value.split(",");
				array.forEach(function (element, index: number) {
					array[index] = [element.trim()];
				});
			}

			newVal.push({ call: element.call, text: element.text, parse_mode: element.parse_mode, nav: array });
		});

		return newVal;
	} catch (err: any) {
		error([
			{ text: "Error EditArray:", val: err.message },
			{ text: "Stack:", val: err.stack },
		]);
		return null;
	}
}

const idBySelector = async (
	_this: any,
	selector: string,
	text: string,
	userToSend: string,
	newline: Newline,
	telegramInstance: string,
	one_time_keyboard: boolean,
	resize_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
): Promise<void> => {
	let text2Send = "";
	try {
		if (!selector.includes("functions")) {
			return;
		}

		const functions = selector.replace("functions=", "");
		let enums = [];
		const result = await _this.getEnumsAsync();

		if (!result || !result["enum.functions"][`enum.functions.${functions}`]) {
			return;
		}
		enums = result["enum.functions"][`enum.functions.${functions}`].common.members;
		if (!enums) {
			return;
		}
		const promises = enums.map(async (id: string) => {
			const value = await _this.getForeignStateAsync(id);
			if (value && value.val !== undefined && value.val !== null) {
				let newText = text;
				let res;

				if (text.includes("{common.name}")) {
					res = await _this.getForeignObjectAsync(id);
					_this.log.debug("Name " + JSON.stringify(res.common.name));

					if (res && res.common.name) {
						newText = newText.replace("{common.name}", res.common.name);
					}
				}
				if (text.includes("&amp;&amp;")) {
					text2Send += newText.replace("&amp;&amp;", value.val);
				} else if (text.includes("&&")) {
					text2Send += newText.replace("&&", value.val);
				} else {
					text2Send += newText;
					text2Send += " " + value.val;
				}
			}
			if (newline === "true") {
				text2Send += " \n";
			} else {
				text2Send += " ";
			}
			_this.log.debug("text2send " + JSON.stringify(text2Send));
		});
		Promise.all(promises)
			.then(() => {
				sendToTelegram(userToSend, text2Send, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, "");
				debug([
					{ text: "TextToSend:", val: text2Send },
					{ text: "UserToSend:", val: userToSend },
				]);
			})
			.catch((e) => {
				error([
					{ text: "Error Promise:", val: e.message },
					{ text: "Stack:", val: e.stack },
				]);
			});
	} catch (error: any) {
		error([
			{ text: "Error idBySelector:", val: error.message },
			{ text: "Stack:", val: error.stack },
		]);
	}
};

async function generateNewObjectStructure(val: GeneratedNavMenu[] | null): Promise<NewObjectNavStructure | null> {
	try {
		if (!val) {
			return null;
		}
		const obj: NewObjectNavStructure = {};
		val.forEach(function (element) {
			const call = element.call;
			obj[call] = {
				nav: element.nav,
				text: element.text,
				parse_mode: element.parse_mode == "true" || element.parse_mode == "false" ? element.parse_mode : "false",
			};
		});
		return obj;
	} catch (err: any) {
		error([
			{ text: "Error GenerateNewObjectStructure:", val: err.message },
			{ text: "Stack:", val: err.stack },
		]);
		return null;
	}
}

function generateActions(action: Actions, userObject: NewObjectNavStructure): { obj: NewObjectNavStructure; ids: string[] } | undefined {
	try {
		const arrayOfEntries: GenerateActionsArrayOfEntries[] = [
			{
				objName: "echarts",
				name: "echarts",
				loop: "preset",
				elements: [{ name: "preset" }, { name: "echartInstance" }, { name: "background" }, { name: "theme" }, { name: "filename" }],
			},
			{
				objName: "loc",
				name: "location",
				loop: "latitude",
				elements: [{ name: "latitude" }, { name: "longitude" }, { name: "parse_mode", key: 0 }],
			},
			{
				objName: "pic",
				name: "sendPic",
				loop: "IDs",
				elements: [{ name: "id", value: "IDs" }, { name: "fileName" }, { name: "delay", value: "picSendDelay" }],
			},
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

		const listOfSetStateIds: string[] = [];
		action.set.forEach(function (element, key) {
			if (key == 0) {
				userObject[element.trigger] = { switch: [] };
			}
			userObject[element.trigger] = { switch: [] };
			element.IDs.forEach(function (id: string, index: number) {
				listOfSetStateIds.push(id);
				const toggle = element.switch_checkbox[index] === "true";
				let value;

				if (element.values[index] === "true" || element.values[index] === "false") {
					value = element.values[index] === "true";
				} else {
					value = element.values[index];
				}
				const newObj: Switch = {
					id: element.IDs[index],
					value: value,
					toggle: toggle,
					confirm: element.confirm[index],
					returnText: element.returnText[index],
					ack: element.ack ? element.ack[index] : false,
					parse_mode: element.parse_mode ? element.parse_mode[0] : false,
				};
				if (userObject[element.trigger] && userObject[element.trigger]?.switch) {
					userObject[element.trigger].switch!.push(newObj);
				}
			});
		});

		arrayOfEntries.forEach((item) => {
			if (action[item.objName as keyof Actions]) {
				action[item.objName as keyof Actions].forEach(function (element, index: number) {
					userObject[element.trigger] = { [item.name]: [] };
					if (index == 0) {
						userObject[element.trigger] = { [item.name as keyof UserObjectActions]: [] };
					}

					element[item.loop].forEach(function (id: string, key: number) {
						const newObj: GenerateActionsNewObject = {};
						item.elements.forEach((elementItem) => {
							const name = elementItem.name;
							const value = elementItem.value ? elementItem.value : elementItem.name;
							const newKey = elementItem.key ? elementItem.key : key;
							let val: string | boolean;

							if (!element[value]) {
								val = false;
							} else {
								val = element[value][newKey];
							}
							if (val == undefined) {
								val = "false";
							}

							if (elementItem.type == "text" && typeof val === "string") {
								newObj[name as keyof GenerateActionsNewObject] = val.replace(/&amp;/g, "&") as any;
							} else {
								newObj[name as keyof GenerateActionsNewObject] = val as any;
							}
						});
						if (item.name && typeof item.name === "string") {
							userObject[element.trigger as NewObjectNavStructureKey][item?.name as keyof Part].push(newObj);
						}
					});
				});
			}
		});

		return { obj: userObject, ids: listOfSetStateIds };
	} catch (err: any) {
		error([
			{ text: "Error generateActions:", val: err.message },
			{ text: "Stack:", val: err.stack },
		]);
	}
}

function roundValue(val: string, textToSend: string): { val: string; textToSend: string } | undefined {
	try {
		const floatedNumber = parseFloat(val);
		const { substring, textWithoutSubstring } = decomposeText(textToSend, "{round:", "}");

		const decimalPlaces = substring.split(":")[1].replace("}", "");
		const floatedString = floatedNumber.toFixed(parseInt(decimalPlaces));
		return { val: floatedString, textToSend: textWithoutSubstring };
	} catch (err: any) {
		error([
			{ text: "Error roundValue:", val: err.message },
			{ text: "Stack:", val: err.stack },
		]);
	}
}

const exchangePlaceholderWithValue = (textToSend: string, text: string | number): string => {
	let searchString = "";
	if (textToSend.includes("&&")) {
		searchString = "&&";
	} else if (textToSend.includes("&amp;&amp;")) {
		searchString = "&amp;&amp;";
	}
	searchString !== "" && textToSend.toString().indexOf(searchString) != -1
		? (textToSend = textToSend.replace(searchString, text.toString()))
		: (textToSend += " " + text);

	return textToSend;
};

const adjustValueType = (value: keyof NewObjectNavStructure, valueType: string): boolean | string | number => {
	if (valueType == "number") {
		if (!parseFloat(value as string)) {
			error([{ text: "Error: Value is not a number:", val: value }]);
			return false;
		}
		return parseFloat(value as string);
	}
	if (valueType == "boolean") {
		if (value == "true") {
			return true;
		}
		error([{ text: "Error: Value is not a boolean:", val: value }]);
		return false;
	}
	return value;
};

const checkEvent = (
	dataObject: DataObject,
	id: string,
	state: ioBroker.State,
	menuData: MenuData,
	userListWithChatID: UserListWithChatId[],
	instanceTelegram: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
	usersInGroup: UserInGroup,
): boolean => {
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
						if (part.nav) {
							backMenuFunc(calledNav, part.nav, user);
						}
						if (part && part.nav && JSON.stringify(part?.nav[0]).includes("menu:")) {
							callSubMenu(
								JSON.stringify(part?.nav[0]),
								menuData,
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
							sendNav(part, user, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
						}
					});
				}
			});
		}
	}

	return ok;
};

const getUserToSendFromUserListWithChatID = (userListWithChatID: UserListWithChatId[], chatID: ioBroker.State | undefined | null): string | null => {
	let userToSend: string | null = null;

	if (!chatID) {
		return null;
	}

	userListWithChatID.forEach((element) => {
		if (element.chatID == chatID.val) {
			userToSend = element.name;
		}

		debug([
			{ text: "User and ChatID:", val: element },
			{ text: "User:", val: userToSend },
		]);
	});

	return userToSend;
};
const getMenusWithUserToSend = (menusWithUsers: MenusWithUsers, userToSend: string): NewObjectNavStructureKey[] => {
	const menus: NewObjectNavStructureKey[] = [];
	for (const key in menusWithUsers) {
		if (menusWithUsers[key].includes(userToSend)) {
			menus.push(key);
		}
	}
	return menus;
};

export {
	editArrayButtons,
	idBySelector,
	generateNewObjectStructure,
	generateActions,
	calcValue,
	roundValue,
	bindingFunc,
	exchangePlaceholderWithValue,
	adjustValueType,
	checkEvent,
	getUserToSendFromUserListWithChatID,
	getMenusWithUserToSend,
};
