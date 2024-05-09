const { switchBack } = require("./backMenu");
const setstate = require("./setstate").setstate;
const { sendToTelegram, sendToTelegramSubmenu } = require("./telegram");
const { checkStatusInfo } = require("./utilities");
const { _subscribeAndUnSubscribeForeignStatesAsync } = require("./subscribeStates");
const { deleteMessageIds } = require("./messageIds");
const { dynamicSwitch } = require("./dynamicSwitch");

let step = 0;
let returnIDToListenTo: ReturnIdToListenTo[] = [];
let splittedData: SplittedData = [];

/**
 * Calls the submenu
 * @param {*} _this
 * @param {string} calledValue - Value of the button [["menu:percent10:r1:"]]
 * @param {{}} menuData
 * @param {string} userToSend
 * @param {string} instanceTelegram
 * @param {boolean} resize_keyboard
 * @param {boolean} one_time_keyboard
 * @param {[]} userListWithChatID
 * @param {object} part
 * @param {{}} allMenusWithData
 * @param {array} menus
 * @param {*} setStateIdsToListenTo
 * @returns array setStateIdsToListenTo
 */
async function callSubMenu(
	_this: any,
	calledValue: string,
	menuData: MenuData,
	userToSend: string,
	instanceTelegram: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
	part: Part,
	allMenusWithData: AllMenusWithData,
	menus: Menus,
	setStateIdsToListenTo: SetStateIdsToListenTo[],
) {
	try {
		_this.log.debug("type of " + JSON.stringify(typeof calledValue));
		const subMenuData = await subMenu(
			_this,
			calledValue,
			menuData,
			userToSend,
			instanceTelegram,
			resize_keyboard,
			one_time_keyboard,
			userListWithChatID,
			part,
			allMenusWithData,
			menus,
		);
		_this.log.debug("Submenu data " + JSON.stringify(subMenuData));
		let newNav = null;
		if (subMenuData && subMenuData[4]) {
			newNav = subMenuData[4];
		}
		if (subMenuData && subMenuData[3]) {
			_this.log.debug("SubmenuData3" + JSON.stringify(subMenuData[3]));
			if (subMenuData[3]) setStateIdsToListenTo = subMenuData[3];
			_subscribeAndUnSubscribeForeignStatesAsync(setStateIdsToListenTo, _this, true);
		}
		if (subMenuData && typeof subMenuData[0] == "string" && subMenuData[1] && typeof subMenuData[1] == "string") {
			sendToTelegramSubmenu(_this, userToSend, subMenuData[0], subMenuData[1], instanceTelegram, userListWithChatID, part.parse_mode);
		}
		return { setStateIdsToListenTo: setStateIdsToListenTo, newNav: newNav };
	} catch (e: any) {
		_this.log.error("Error callSubMenu: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
/**
 * finds the Submenu and calls it
 * @param {*} _this
 * @param {string} calledValue - Value of the button [["menu:percent10:r1:"]]
 * @param {{}} menuData - Data of the group
 * @param {string} userToSend - user to send the message to
 * @param {string} instanceTelegram - instance of telegram
 * @param {boolean} resize_keyboard - resize keyboard
 * @param {boolean} one_time_keyboard - one time keyboard
 * @param {[]} userListWithChatID - array with chatID and username
 * @param {object} part - Part of the menu
 * @returns [text, keyboard, device2Switch, returnIDToListenTo, navToGoBack]
 */
async function subMenu(_this: any, calledValue: string, menuData: MenuData, userToSend: string, instanceTelegram: string, resize_keyboard: boolean, one_time_keyboard: boolean, userListWithChatID: UserListWithChatId[], part: Part, allMenusWithData: AllMenusWithData, menus: Menus) {
	try {
		_this.log.debug("CalledValue: " + JSON.stringify(calledValue));
		let text = "";
		if (part && part.text && part.text != "") text = await checkStatusInfo(_this, part.text);
		let splittedText = [];
		let callbackData = "";
		let device2Switch: keyof MenuData = "";
		if (calledValue.includes('"')) {
			splittedText = calledValue.split(`"`)[1].split(":");
		} else {
			splittedText = calledValue.split(":");
		}
		device2Switch = splittedText[2];
		callbackData = splittedText[1];

		_this.log.debug("callbackData: 	" + JSON.stringify(callbackData));
		_this.log.debug("splittet Data of callbackData " + JSON.stringify(splittedText[1]));
		_this.log.debug("deviceToSwitch: 	" + JSON.stringify(device2Switch));
		_this.log.debug("text: 	" + JSON.stringify(calledValue));

		if (callbackData.includes("delete")) {
			const navToGoBack = splittedText[2];
			if (callbackData.includes("deleteAll")) {
				deleteMessageIds(_this, userToSend, userListWithChatID, instanceTelegram, "all");
			}
			if (navToGoBack && navToGoBack != "") return [null, null, null, null, navToGoBack];
			else _this.log.debug("Please insert a Menu in your Delete Submenu");
			return;
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
			const result = await setstate(_this, menuData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
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
			const result = await setstate(_this, menuData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];
		} else if (callbackData.includes("dynSwitch")) {
			// Dynamisches Switch
			return dynamicSwitch(_this, calledValue, device2Switch, text);
		} else if (callbackData.includes("dynS")) {
			_this.log.debug("SplittedData " + JSON.stringify(splittedData));
			const val = splittedText[3];
			const result = await setstate(_this, menuData[device2Switch], userToSend, val, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];
		}

		//ANCHOR - Percent
		else if (!calledValue.includes("submenu") && callbackData.includes("percent")) {
			step = parseFloat(callbackData.replace("percent", ""));
			let rowEntries = 0;
			let menu: ArrayOfEntriesDynamicSwitch[] = [];
			const keyboard: Keyboard = {
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
				rowEntries++;
				if (rowEntries == 8) {

					keyboard.inline_keyboard.push(menu);
					menu = [];
					rowEntries = 0;
				}
			}

			if (rowEntries != 0) keyboard.inline_keyboard.push(menu);
			return [text, JSON.stringify(keyboard), device2Switch];
		} else if (calledValue.includes(`submenu:percent${step}`)) {
			const value = parseInt(calledValue.split(":")[1].split(",")[1]);

			const result = await setstate(_this, menuData[device2Switch], userToSend, value, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];

			//ANCHOR - Number
		} else if (!calledValue.includes("submenu") && callbackData.includes("number")) {
			if (callbackData.includes("(-)")) callbackData = callbackData.replace("(-)", "negativ");
			const splittedData = callbackData.replace("number", "").split("-");
			let rowEntries = 0;
			let menu = [];
			const keyboard = {
				inline_keyboard: [],
			};
			let unit = "";
			if (splittedData[3] != "") unit = splittedData[3];
			let start = 0,
				end = 0;
			const firstValueInText = parseFloat(splittedData[0].includes("negativ") ? splittedData[0].replace("negativ", "-") : splittedData[0]);
			const secondValueInText = parseFloat(splittedData[1].includes("negativ") ? splittedData[1].replace("negativ", "-") : splittedData[1]);

			if (firstValueInText < secondValueInText) {
				start = secondValueInText;
				end = firstValueInText;
			} else {
				start = firstValueInText;
				end = secondValueInText;
			}
			let index = -1;

			let maxEntriesPerRow = 8;
			const step = parseFloat(splittedData[2].includes("negativ") ? splittedData[2].replace("negativ", "-") : splittedData[2]);
			if (step < 1) maxEntriesPerRow = 6;

			for (let i = start; i >= end; i -= step) {
				// Zahlen umdrehen
				if (parseFloat(splittedData[0]) < parseFloat(splittedData[1])) {
					if (i === start) index = end - step;
					index = index + step;
				} else {
					index = i;
				}
				menu.push({
					text: `${index}${unit}`,
					callback_data: `submenu:${callbackData}:${device2Switch}:${index}`,
				});
				rowEntries++;
				if (rowEntries == maxEntriesPerRow) {
					// @ts-ignore
					keyboard.inline_keyboard.push(menu);
					menu = [];
					rowEntries = 0;
				}
			}
			// @ts-ignore
			if (rowEntries != 0) keyboard.inline_keyboard.push(menu);
			_this.log.debug("keyboard " + JSON.stringify(keyboard.inline_keyboard));
			return [text, JSON.stringify(keyboard), device2Switch];
		} else if (calledValue.includes(`submenu:${callbackData}`)) {
			_this.log.debug("CallbackData" + JSON.stringify(callbackData));
			const value = parseFloat(calledValue.split(":")[3]);
			device2Switch = calledValue.split(":")[2];
			_this.log.debug(JSON.stringify({ device2Switch: device2Switch, data: menuData, user: userToSend, value: value }));
			const result = await setstate(_this, menuData[device2Switch], userToSend, value, true, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return [null, null, null, returnIDToListenTo];
		}
		//ANCHOR - Back menu
		else if (callbackData === "back") {
			const result = await switchBack(_this, userToSend, allMenusWithData, menus);
			if (result) sendToTelegram(_this, userToSend, result["texttosend"], result["menuToSend"], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, result["parseMode"]);
		}
	} catch (error: any) {
		_this.log.error("Error subMenu: " + JSON.stringify(error.message + error.stack));
	}
}

module.exports = {
	subMenu,
	callSubMenu,
};
