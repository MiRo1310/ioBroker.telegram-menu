let setStateIdsToListenTo = [];
let timeouts = [];
const { sendToTelegram } = require("./telegram");
const { sendNav } = require("./sendNav");
const { callSubMenu } = require("./subMenu");
const { backMenuFunc, switchBack } = require("./backMenu");
const { setstate } = require("./setstate");
const { getstate } = require("./getstate");
const { sendPic } = require("./sendpic");
const { sendLocationToTelegram } = require("./telegram");
const { getDynamicValue, removeUserFromDynamicValue } = require("./dynamicValue");
const { adjustValueType } = require("./action");
const { _subscribeAndUnSubscribeForeignStatesAsync } = require("./subscribeStates");
const { getChart } = require("./echarts");
const { httpRequest } = require("./httpRequest");

/**
 *
 * @param {*} _this
 * @param {*} menuData
 * @param {*} calledValue
 * @param {*} userToSend
 * @param {*} instanceTelegram
 * @param {*} resize_keyboard
 * @param {*} one_time_keyboard
 * @param {*} userListWithChatID
 * @param {*} menus
 * @param {*} userActiveCheckbox
 * @param {*} token
 * @param {*} directoryPicture
 * @param {*} timeoutKey
 * @returns true if data was found
 */
async function checkEveryMenuForData(
	_this,
	menuData,
	calledValue,
	userToSend,
	instanceTelegram,
	resize_keyboard,
	one_time_keyboard,
	userListWithChatID,
	menus,
	userActiveCheckbox,
	token,
	directoryPicture,
	timeoutKey,
) {
	// Alle Menus durchgehen und nach Daten suchen
	for (const menu of menus) {
		let groupData;
		if (menuData.data) groupData = menuData.data[menu];
		else if (menuData[menu]) groupData = menuData[menu];

		_this.log.debug("Nav: " + JSON.stringify(groupData));
		_this.log.debug("Menu: " + JSON.stringify(menuData.data));
		_this.log.debug("Group: " + JSON.stringify(menu));

		if (
			await processData(
				_this,
				groupData,
				calledValue,
				userToSend,
				menu,
				instanceTelegram,
				resize_keyboard,
				one_time_keyboard,
				userListWithChatID,
				menuData.data,
				menus,
				menu,
				userActiveCheckbox,
				token,
				directoryPicture,
				timeoutKey,
			)
		) {
			_this.log.debug("CalledText found");
			return true;
		}
	}
	return false;
}

/**
 *
 * @param {*} _this
 * @param {{}} menuData Data of the Group
 * @param {string} calledValue Value, which was called
 * @param {string} userToSend  User, which should get the message
 * @param {string} groupWithUser  Group with the User
 * @param {string} instanceTelegram  Instance of Telegram
 * @param {boolean} resize_keyboard  Resize Keyboard
 * @param {boolean} one_time_keyboard One Time Keyboard
 * @param {*} userListWithChatID User List with ChatID
 * @param {{}} allMenusWithData All Menus with Data
 * @param {*} menus All Menus
 * @param {string} menu Menu
 * @returns true, if data was found, else false
 */
async function processData(
	_this,
	menuData,
	calledValue,
	userToSend = "",
	groupWithUser,
	instanceTelegram,
	resize_keyboard,
	one_time_keyboard,
	userListWithChatID,
	allMenusWithData,
	menus,
	menu,
	userActiveCheckbox,
	token,
	directoryPicture,
	timeoutKey,
) {
	try {
		let part;
		let call;
		// Wenn der Wert dynamisch gesetzt werden soll wird der Wert abgerufen und der Wert gesetzt und die Funktion beendet
		if (getDynamicValue(userToSend)) {
			const res = getDynamicValue(userToSend);
			let valueToSet;
			if (res.valueType) valueToSet = adjustValueType(_this, calledValue, res.valueType);
			else valueToSet = calledValue;
			if (valueToSet) await _this.setForeignStateAsync(res.id, valueToSet, res.ack);
			else
				sendToTelegram(
					_this,
					userToSend,
					`You insert a wrong Type of value, please insert type: ${res.valueType}`,
					undefined,
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					"",
				);
			removeUserFromDynamicValue(userToSend);
			const result = await switchBack(_this, userToSend, allMenusWithData, menus, true);
			console.log("Result: " + JSON.stringify(result));
			if (result)
				sendToTelegram(
					_this,
					userToSend,
					result["texttosend"],
					result["menuToSend"],
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					result["parseMode"],
				);
			else sendNav(_this, part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
			return true;
		}
		if (calledValue.includes("menu:")) call = calledValue.split(":")[2];
		else call = calledValue;
		if (menuData[call] && !calledValue.includes("menu:") && userToSend && groupWithUser && userActiveCheckbox[groupWithUser]) {
			part = menuData[call];
			// Navigation
			if (part.nav) {
				_this.log.debug("Menu to Send: " + JSON.stringify(part.nav));
				backMenuFunc(_this, call, part.nav, userToSend);
				if (JSON.stringify(part.nav).includes("menu:")) {
					_this.log.debug("Submenu");
					const result = await callSubMenu(
						_this,
						JSON.stringify(part.nav),
						menuData,
						userToSend,
						instanceTelegram,
						resize_keyboard,
						one_time_keyboard,
						userListWithChatID,
						part,
						allMenusWithData,
						menus,
						setStateIdsToListenTo,
					);
					if (result && result.setStateIdsToListenTo) setStateIdsToListenTo = result.setStateIdsToListenTo;
					if (result && result.newNav) {
						checkEveryMenuForData(
							_this,
							allMenusWithData,
							result.newNav,
							userToSend,
							instanceTelegram,
							resize_keyboard,
							one_time_keyboard,
							userListWithChatID,
							menus,
							userActiveCheckbox,
							token,
							directoryPicture,
							timeoutKey,
						);
					}
				} else {
					sendNav(_this, part, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
				}
				return true;
			}
			// Schalten
			else if (part.switch) {
				const result = await setstate(_this, part, userToSend, 0, false, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID);
				if (result) setStateIdsToListenTo = result;
				_this.log.debug("SubmenuData3" + JSON.stringify(setStateIdsToListenTo));
				if (Array.isArray(setStateIdsToListenTo)) _subscribeAndUnSubscribeForeignStatesAsync(setStateIdsToListenTo, _this, true);
				return true;
			} else if (part.getData) {
				getstate(_this, part, userToSend, instanceTelegram, one_time_keyboard, resize_keyboard, userListWithChatID);
				return true;
			} else if (part.sendPic) {
				const result = sendPic(
					_this,
					part,
					userToSend,
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					token,
					directoryPicture,
					timeouts,
					timeoutKey,
				);
				if (result) timeouts = result;
				else _this.log.debug("Timeouts not found");

				return true;
			} else if (part.location) {
				_this.log.debug("Send Location");
				sendLocationToTelegram(_this, userToSend, part.location, instanceTelegram, userListWithChatID);
				return true;
			} else if (part.echarts) {
				_this.log.debug("Echarts");
				await getChart(_this, part.echarts, directoryPicture, userToSend, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard);
				return true;
			} else if (part.httpRequest) {
				const result = await httpRequest(_this, part, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture);
				if (result) return true;
			}
		} else if ((calledValue.startsWith("menu") || calledValue.startsWith("submenu")) && menuData[call]) {
			_this.log.debug("Call Submenu");
			const result = await callSubMenu(
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
				setStateIdsToListenTo,
			);
			if (result && result.setStateIdsToListenTo) setStateIdsToListenTo = result.setStateIdsToListenTo;
			return true;
		} else {
			return false;
		}
	} catch (e) {
		_this.log.error("Error processData: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}

function getStateIdsToListenTo() {
	return setStateIdsToListenTo;
}
function getTimeouts() {
	return timeouts;
}

module.exports = {
	getStateIdsToListenTo,
	getTimeouts,
	checkEveryMenuForData,
};
