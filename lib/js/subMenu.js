const setstate = require("./setstate").setstate;
let step = 0;
let device2Switch = "";
/**
 *
 * @param {*} _this
 * @param {string} text
 * @param {*} groupData
 * @param {string} userToSend
 * @returns
 */
function subMenu(_this, text, groupData, userToSend) {
	const splittetText = JSON.stringify(text).split(":");
	const callbackData = splittetText[1];
	_this.log.debug("splittet text2 " + JSON.stringify(splittetText[2]));
	_this.log.debug("callback: 	" + JSON.stringify(callbackData));
	_this.log.debug("devicetoswitch: 	" + JSON.stringify(device2Switch));
	_this.log.debug("text: 	" + JSON.stringify(text));

	if (callbackData === "yes-no") {
		const keyboard = {
			inline_keyboard: [
				[
					{
						text: "Yes",
						callback_data: "menu:yes",
					},
					{
						text: "No",
						callback_data: "menu:no",
					},
				],
			],
		};
		return ["Wähle eine Option", JSON.stringify(keyboard), device2Switch];
	} else if (callbackData === "yes") {
		setstate(_this, groupData[device2Switch], userToSend, true);
	} else if (callbackData === "no") {
		setstate(_this, groupData[device2Switch], userToSend, false);
	} else if (callbackData === "on-off") {
		const keyboard = {
			inline_keyboard: [
				[
					{
						text: "On",
						callback_data: "menu:on:",
					},
					{
						text: "Off",
						callback_data: "menu:off:",
					},
				],
			],
		};
		device2Switch = splittetText[2];
		return ["Wähle eine Option", JSON.stringify(keyboard), device2Switch];
	} else if (callbackData === "on") {
		setstate(_this, groupData[device2Switch], userToSend, true, true);
	} else if (callbackData === "off") {
		setstate(_this, groupData[device2Switch], userToSend, false, true);
	} else if (!text.includes("submenu") && callbackData.includes("percent")) {
		step = parseInt(callbackData.replace("percent", ""));
		let rowEntrys = 0;
		let menu = [];
		const keyboard = {
			inline_keyboard: [],
		};
		for (let i = 100; i >= 0; i -= step) {
			menu.push({
				text: `${i}%`,
				callback_data: `submenu:percent${step}:${i}:`,
			});
			if (i != 0 && i - step < 0)
				menu.push({
					text: `0%`,
					callback_data: `submenu:percent${step}:${0}:`,
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

		device2Switch = splittetText[2];
		return ["Welcher Wert soll gesetzt werden?", JSON.stringify(keyboard), device2Switch];
	} else if (text.includes(`submenu:percent${step}`)) {
		const value = parseInt(text.split(":")[2]);
		setstate(_this, groupData[device2Switch], userToSend, value, true);
	} else if (!text.includes("submenu") && callbackData.includes("number")) {
		let splittedData = callbackData.replace("number", "").split("-");
		let rowEntrys = 0;
		let menu = [];
		const keyboard = {
			inline_keyboard: [],
		};
		let unit = "";
		if (splittedData[3] != "") unit = splittedData[3];
		for (let i = parseInt(splittedData[1]); i >= parseInt(splittedData[0]); i -= parseInt(splittedData[2])) {
			menu.push({
				text: `${i}${unit}`,
				callback_data: `submenu:${callbackData}:${i}:`,
			});
			_this.log.debug("menu " + JSON.stringify(menu));
			_this.log.debug("keyboard " + JSON.stringify(keyboard.inline_keyboard));
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
		device2Switch = splittetText[2];
		return ["Welcher Wert soll gesetzt werden?", JSON.stringify(keyboard), device2Switch];
	} else if (text.includes(`submenu:${callbackData}`)) {
		const value = parseInt(text.split(":")[2]);
		setstate(_this, groupData[device2Switch], userToSend, value, true);
		_this.log.debug("cal 	" + JSON.stringify(callbackData));
	}
}
module.exports = {
	subMenu: subMenu,
};
