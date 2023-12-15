const setstate = require("./setstate").setstate;
const { sendToTelegram, sendToTelegramSubmenu } = require("./telegram");
const { checkStatusInfo } = require("./utilities");
const { _subscribeAndUnSubscribeForeignStatesAsync } = require("./subscribeStates");
const { deleteMessageIds } = require("./messageIds");

let step = 0;
let returnIDToListenTo = [];
let splittedData = [];
const backMenu = {};
/**
 *
 * @param {*} _this
 * @param {string} calledValue
 * @param {{}} groupData - Data of the group
 * @param {string} userToSend - user to send the message to
 * @returns []
 */
async function subMenu(_this, calledValue, groupData, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, part, menuData, menus) {
	try {
		_this.log.debug("CalledValue: " + JSON.stringify(calledValue));
		let text = "";
		if (part && part.text && part.text != "") text = await checkStatusInfo(_this, part.text);
		let splittedText = [];
		let callbackData = "";
		let device2Switch = "";
		if (calledValue.includes('"')) {
			splittedText = calledValue.split(`"`)[1].split(":");
		} else {
			splittedText = calledValue.split(":");
		}
		device2Switch = splittedText[2];
		callbackData = splittedText[1];

		_this.log.debug("callbackData: 	" + JSON.stringify(callbackData));
		_this.log.debug("splittet Data of callbackData " + JSON.stringify(splittedText[1]));
		_this.log.debug("devicetoswitch: 	" + JSON.stringify(device2Switch));
		_this.log.debug("text: 	" + JSON.stringify(calledValue));

		if (callbackData.includes("delete")) {
			const navToGoBack = splittedText[2];
			deleteMessageIds(_this, userToSend, userListWithChatID, instanceTelegram, navToGoBack, resize_keyboard, one_time_keyboard, menuData, menus, part);
			return { navToGoBack: navToGoBack, userToSend: userToSend };
		} else if (callbackData.includes("switch")) {
			//ANCHOR -  Switch
			splittedData = callbackData.split("-");
			const keyboard = {
				inline_keyboard: [
					[
						{
							text: splittedData[1].split(".")[0],
							callback_data: `menu:first:${device2Switch}`,
						},
						{
							text: splittedData[2].split(".")[0],
							callback_data: `menu:second:${device2Switch}`,
						},
					],
				],
			};
			return [text, JSON.stringify(keyboard), device2Switch];
		} else if (callbackData.includes("first")) {
			let val;
			_this.log.debug("SplittedData " + JSON.stringify(splittedData));
			if (splittedData[1].split(".")[1] == "false") {
				val = false;
			} else if (splittedData[1].split(".")[1] == "true") {
				val = true;
			} else {
				val = splittedData[1].split(".")[1];
			}
			const result = await setstate(_this, groupData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];
		} else if (callbackData.includes("second")) {
			let val;
			if (splittedData[2].split(".")[1] == "false") {
				val = false;
			} else if (splittedData[2].split(".")[1] == "true") {
				val = true;
			} else {
				val = splittedData[2].split(".")[1];
			}
			const result = await setstate(_this, groupData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];
		} else if (callbackData.includes("dynSwitch")) {
			// menu:dynSwitch[a, b,c]:TRIGGER:LenghtOfRow:
			try {
				const splittedArray = calledValue.replace(/"/g, "").split(":");
				device2Switch = splittedArray[2];
				const arrayOfValues = splittedArray[1].replace("dynSwitch", "").replace(/\]/g, "").replace(/\[/g, "").split(",");

				const lengthOfRow = parseInt(splittedArray[3]) || 6;

				const array = [];
				const keyboard = { inline_keyboard: array };
				if (arrayOfValues) {
					let arrayOfEntrys = [];
					arrayOfValues.forEach((value, index) => {
						if (value.includes(".")) {
							const splittedValue = value.split(".");
							arrayOfEntrys.push({ text: splittedValue[0], callback_data: `menu:dynS:${device2Switch}:${splittedValue[1]}` });
						} else arrayOfEntrys.push({ text: value, callback_data: `menu:dynS:${device2Switch}:${value}` });
						if (((index + 1) % lengthOfRow == 0 && index != 0 && arrayOfValues.length > 0) || index + 1 == arrayOfValues.length) {
							keyboard.inline_keyboard.push(arrayOfEntrys);
							arrayOfEntrys = [];
						}
					});
					return [text, JSON.stringify(keyboard), device2Switch];
				}
			} catch (e) {
				_this.log.error("Error parsing dynSwitch: " + JSON.stringify(e.message));
				_this.log.error(JSON.stringify(e.stack));
			}
		} else if (callbackData.includes("dynS")) {
			_this.log.debug("SplittedData " + JSON.stringify(splittedData));
			const val = splittedText[3];
			const result = await setstate(_this, groupData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];
		}

		//ANCHOR - Percent
		else if (!calledValue.includes("submenu") && callbackData.includes("percent")) {
			step = parseFloat(callbackData.replace("percent", ""));
			let rowEntrys = 0;
			let menu = [];
			const keyboard = {
				inline_keyboard: [],
			};
			for (let i = 100; i >= 0; i -= step) {
				menu.push({
					text: `${i}%`,
					callback_data: `submenu:percent${step},${i}:${device2Switch}`,
				});
				if (i != 0 && i - step < 0)
					menu.push({
						text: `0%`,
						callback_data: `submenu:percent${step},${0}:${device2Switch}`,
					});
				rowEntrys++;
				if (rowEntrys == 8) {
					// @ts-ignore
					keyboard.inline_keyboard.push(menu);
					menu = [];
					rowEntrys = 0;
				}
			}
			// @ts-ignore
			if (rowEntrys != 0) keyboard.inline_keyboard.push(menu);
			return [text, JSON.stringify(keyboard), device2Switch];
		} else if (calledValue.includes(`submenu:percent${step}`)) {
			const value = parseInt(calledValue.split(":")[1].split(",")[1]);

			const result = await setstate(_this, groupData[device2Switch], userToSend, value, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];

			//ANCHOR - Number
		} else if (!calledValue.includes("submenu") && callbackData.includes("number")) {
			const splittedData = callbackData.replace("number", "").split("-");
			let rowEntrys = 0;
			let menu = [];
			const keyboard = {
				inline_keyboard: [],
			};
			let unit = "";
			if (splittedData[3] != "") unit = splittedData[3];
			let start = 0,
				end = 0;

			if (parseInt(splittedData[0]) < parseInt(splittedData[1])) {
				start = parseInt(splittedData[1]);
				end = parseInt(splittedData[0]);
			} else {
				start = parseInt(splittedData[0]);
				end = parseInt(splittedData[1]);
			}
			let index = -1;

			let maxEntrysPerRow = 8;
			const step = parseFloat(splittedData[2]);
			console.log(start, end);
			console.log("step " + step);
			if (step < 1) maxEntrysPerRow = 6;

			for (let i = start; i >= end; i -= step) {
				// Zahlen umdrehen
				if (parseInt(splittedData[0]) < parseInt(splittedData[1])) {
					if (i === start) index = end - step;
					index = index + step;
				} else {
					index = i;
				}
				menu.push({
					text: `${index}${unit}`,
					callback_data: `submenu:${callbackData}:${device2Switch}:${index}`,
				});
				rowEntrys++;
				if (rowEntrys == maxEntrysPerRow) {
					// @ts-ignore
					keyboard.inline_keyboard.push(menu);
					menu = [];
					rowEntrys = 0;
				}
			}
			// @ts-ignore
			if (rowEntrys != 0) keyboard.inline_keyboard.push(menu);
			_this.log.debug("keyboard " + JSON.stringify(keyboard.inline_keyboard));
			return [text, JSON.stringify(keyboard), device2Switch];
		} else if (calledValue.includes(`submenu:${callbackData}`)) {
			_this.log.debug("CallbackData" + JSON.stringify(callbackData));
			const value = parseInt(calledValue.split(":")[3]);
			device2Switch = calledValue.split(":")[2];
			_this.log.debug(JSON.stringify({ device2Switch: device2Switch, data: groupData, user: userToSend, value: value }));
			const result = await setstate(_this, groupData[device2Switch], userToSend, value, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];
		}
		//ANCHOR - Back menu
		else if (callbackData === "back") {
			const list = backMenu[userToSend].list;
			let menuToSend;
			if (list.lenght != 0) {
				for (const menu of menus) {
					if (menuData[menu][list[list.length - 1]]) {
						menuToSend = menuData[menu][list[list.length - 1]].nav;
						_this.log.debug("Menu call found");
						break;
					}
					_this.log.debug("Menu call not found in this Menu");
				}
				if (menuToSend !== "") {
					sendToTelegram(_this, userToSend, list[list.length - 1], menuToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
				}
			}
			backMenu[userToSend].last = list.pop();
		}
	} catch (error) {
		_this.log.error("Error subMenu: " + JSON.stringify(error.message + error.stack));
	}
}

/**
 *  Saves the last menu to go back to
 * @param {*} _this
 * @param {string} nav - nav of the menu
 * @param {*} part - part of the menu
 * @param {string} userToSend - user to send the message to
 */
function backMenuFunc(_this, nav, part, userToSend) {
	if (!part || !JSON.stringify(part).split(`"`)[1].includes("menu:")) {
		if (backMenu[userToSend] && backMenu[userToSend].list.length === 20) {
			backMenu[userToSend].list.shift();
		} else if (!backMenu[userToSend]) {
			backMenu[userToSend] = { list: [], last: "" };
		}
		if (backMenu[userToSend].last !== "") backMenu[userToSend].list.push(backMenu[userToSend].last);
		backMenu[userToSend].last = nav;
	}
	_this.log.debug("goBackMenu" + JSON.stringify(backMenu));
}
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
			_subscribeAndUnSubscribeForeignStatesAsync(setStateIdsToListenTo, _this, true);
		}
		if (subMenuData && typeof subMenuData[0] == "string") {
			sendToTelegramSubmenu(_this, userToSend, subMenuData[0], subMenuData[1], instanceTelegram, userListWithChatID, part.parse_mode);
		}
		return setStateIdsToListenTo;
	} catch (e) {
		_this.log.error("Error callSubMenu: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}

module.exports = {
	subMenu,
	backMenuFunc,
	callSubMenu,
};
