const setstate = require("./setstate").setstate;
const sendToTelegram = require("./telegram").sendToTelegram;
let step = 0;
let returnIDToListenTo;
let splittedData = [];
const backMenu = {};
/**
 *
 * @param {*} _this
 * @param {string} text
 * @param {*} groupData
 * @param {string} userToSend
 * @returns
 */
function subMenu(
	_this,
	text,
	groupData,
	userToSend,
	instanceTelegram,
	resize_keyboard,
	one_time_keyboard,
	userListWithChatID,
) {
	const splittetText = JSON.stringify(text).split(`"`)[1].split(":");
	const callbackData = splittetText[1];
	let device2Switch = splittetText[2];
	_this.log.debug("callbackData: 	" + JSON.stringify(callbackData));
	_this.log.debug("splittet Data of callbackData " + JSON.stringify(splittetText[1]));
	_this.log.debug("devicetoswitch: 	" + JSON.stringify(device2Switch));
	_this.log.debug("text: 	" + JSON.stringify(text));

	//ANCHOR -  Switch
	if (callbackData.includes("switch")) {
		splittedData = callbackData.split("-");
		const keyboard = {
			inline_keyboard: [
				[
					{
						text: splittedData[1].split(".")[0],
						callback_data: "menu:first",
					},
					{
						text: splittedData[2].split(".")[0],
						callback_data: "menu:second",
					},
				],
			],
		};
		return ["Wähle eine Option", JSON.stringify(keyboard), device2Switch];
	} else if (callbackData.includes("first")) {
		let val;
		splittedData[1].split(".")[1] == "true" ? (val = true) : (val = splittedData[1].split(".")[1]);
		_this.log.debug("val " + JSON.stringify(val));
		returnIDToListenTo = setstate(_this, groupData[device2Switch], userToSend, val, true);
		return [null, null, null, returnIDToListenTo];
	} else if (callbackData.includes("second")) {
		let val;
		splittedData[2].split(".")[1] == "true" ? (val = true) : (val = splittedData[2].split(".")[1]);
		returnIDToListenTo = setstate(_this, groupData[device2Switch], userToSend, val, true);
		return [null, null, null, returnIDToListenTo];
	}

	//ANCHOR - Percent
	else if (!text.includes("submenu") && callbackData.includes("percent")) {
		step = parseInt(callbackData.replace("percent", ""));
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

		return ["Welcher Wert soll gesetzt werden?", JSON.stringify(keyboard), device2Switch];
	} else if (text.includes(`submenu:percent${step}`)) {
		const value = parseInt(text.split(":")[1].split(",")[1]);
		returnIDToListenTo = setstate(_this, groupData[device2Switch], userToSend, value, true);
		return [null, null, null, returnIDToListenTo];

		//ANCHOR - Number
	} else if (!text.includes("submenu") && callbackData.includes("number")) {
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
		for (let i = start; i >= end; i -= parseInt(splittedData[2])) {
			// Zahlen umdrehen
			if (parseInt(splittedData[0]) < parseInt(splittedData[1])) {
				if (i === start) index = end - 1;
				index++;
			} else index = i;

			menu.push({
				text: `${index}${unit}`,
				callback_data: `submenu:${callbackData}:${index}:${device2Switch}`,
			});
			// _this.log.debug("menu " + JSON.stringify(menu));
			// _this.log.debug("keyboard " + JSON.stringify(keyboard.inline_keyboard));
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
		return ["Welcher Wert soll gesetzt werden?", JSON.stringify(keyboard), device2Switch];
	} else if (text.includes(`submenu:${callbackData}`)) {
		const value = parseInt(text.split(":")[2]);
		device2Switch = text.split(":")[3];
		_this.log.debug(
			JSON.stringify({ device2Switch: device2Switch, data: groupData, user: userToSend, value: value }),
		);
		returnIDToListenTo = setstate(_this, groupData[device2Switch], userToSend, value, true);
		return [null, null, null, returnIDToListenTo];
	}
	//ANCHOR - Back menu
	else if (callbackData === "back") {
		const list = backMenu[userToSend].list;
		if (list.length !== 0) {
			sendToTelegram(
				_this,
				userToSend,
				list[list.length - 1],
				groupData[list[list.length - 1]].nav,
				instanceTelegram,
				resize_keyboard,
				one_time_keyboard,
				userListWithChatID,
			);
		}
		backMenu[userToSend].last = list.pop();
	}
}

function backMenuFuc(_this, nav, part, userToSend) {
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
module.exports = {
	subMenu: subMenu,
	backMenuFuc,
};
