const setstate = require("./setstate").setstate;
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
	_this.log.debug("splittet text " + JSON.stringify(splittetText[2]));
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
	} else if (!text.includes("submenu") && callbackData === "percent20") {
		const keyboard = {
			inline_keyboard: [
				[
					{
						text: "100%",
						callback_data: "submenu:percent20:100:",
					},
					{
						text: "80%",
						callback_data: "submenu:percent20:80:",
					},
					{
						text: "60%",
						callback_data: "submenu:percent20:60:",
					},
					{
						text: "40%",
						callback_data: "submenu:percent20:40:",
					},
					{
						text: "20%",
						callback_data: "submenu:percent20:20:",
					},
					{
						text: "0%",
						callback_data: "submenu:percent20:0:",
					},
				],
			],
		};
		device2Switch = splittetText[2];
		return ["Welcher Wert soll gesetzt werden?", JSON.stringify(keyboard), device2Switch];
	} else if (text.includes("submenu:percent20")) {
		_this.log.debug("info");
		const value = parseInt(text.split(":")[2]);
		setstate(_this, groupData[device2Switch], userToSend, value, true);
	} else if (!text.includes("submenu") && callbackData === "percent10") {
		const keyboard = {
			inline_keyboard: [
				[
					{
						text: "100%",
						callback_data: "submenu:percent10:100:",
					},
					{
						text: "90%",
						callback_data: "submenu:percent10:90:",
					},
					{
						text: "80%",
						callback_data: "submenu:percent10:80:",
					},
					{
						text: "70%",
						callback_data: "submenu:percent10:70:",
					},
					{
						text: "60%",
						callback_data: "submenu:percent10:60:",
					},
					{
						text: "50%",
						callback_data: "submenu:percent10:50:",
					},
				],
				[
					{
						text: "40%",
						callback_data: "submenu:percent10:40:",
					},
					{
						text: "30%",
						callback_data: "submenu:percent10:30:",
					},
					{
						text: "20%",
						callback_data: "submenu:percent10:20:",
					},
					{
						text: "10%",
						callback_data: "submenu:percent10:10:",
					},
					{
						text: "0%",
						callback_data: "submenu:percent10:0:",
					},
				],
			],
		};
		device2Switch = splittetText[2];
		return ["Welcher Wert soll gesetzt werden?", JSON.stringify(keyboard), device2Switch];
	} else if (text.startsWith("submenu:percent10")) {
		const value = parseInt(text.split(":")[2]);
		_this.log.debug("value " + JSON.stringify(value));
		setstate(_this, groupData[device2Switch], userToSend, value, true);
	} else if (text === "menu") {
		const keyboard = {
			inline_keyboard: [
				[
					{
						text: "First Level 1 Option",
						callback_data: "menu:firstLevel1",
					},
					{
						text: "First Level 2 Option",
						callback_data: "menu:firstLevel2",
					},
				],
			],
		};
		return ["please select an option", JSON.stringify(keyboard)];
	} else if (text.startsWith("menu:")) {
		const callbackData = text.split(":")[1];
		if (callbackData === "firstLevel1") {
			const keyboard = {
				inline_keyboard: [
					[
						{
							text: "Second Level 1 Option",
							callback_data: "submenu:firstLevel1:secondLevel1",
						},

						{
							text: "Second Level 2 Option",
							callback_data: "submenu:firstLevel1:secondLevel2",
						},
					],

					[
						{
							text: "Back to Main Menu",
							callback_data: "menu:back",
						},
					],
				],
			};

			return ["You selected First Level 1. Please select a sub-option:", JSON.stringify(keyboard)];
		} else if (callbackData === "firstLevel2") {
			// sendTo(`${adapterName}`, "send", { chatId: chatId, text: "You selected First Level 2." });
		} else if (callbackData.startsWith("submenu:firstLevel1:")) {
			const subCallbackData = callbackData.split(":")[2];

			if (subCallbackData === "secondLevel1") {
				const keyboard = {
					inline_keyboard: [
						[
							{
								text: "Back to First Level 1",
								callback_data: "submenu:firstLevel1:back",
							},
							{
								text: "Back to Main Menu",
								callback_data: "menu:back",
							},
						],
					],
				};

				// sendTo(`${adapterName}`, "send", {
				//     chatId: chatId,
				//     text: "You selected Second Level 1. Please select an option:",
				//     reply_markup: JSON.stringify(keyboard),
				// });
				return ["You selected Second Level 1. Please select an option:", JSON.stringify(keyboard)];
			} else if (subCallbackData === "secondLevel2") {
				// sendTo(`${adapterName}`, "send", { chatId: chatId, text: "You selected Second Level 2." });
			}
		} else if (callbackData === "back") {
			const keyboard = {
				inline_keyboard: [
					[
						{
							text: "First Level 1 Option",

							callback_data: "menu:firstLevel1",
						},

						{
							text: "First Level 2 Option",

							callback_data: "menu:firstLevel2",
						},
					],
				],
			};
			return ["Please select an option:", JSON.stringify(keyboard)];
		} else {
			return undefined;
		}
	}
}
module.exports = {
	subMenu: subMenu,
};
