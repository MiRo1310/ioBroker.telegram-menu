function specialMenu(text) {
	if (text === "/menu") {
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

		// sendTo(`${adapterName}`, "send", {
		//     chatId: chatId,
		//     text: "Please select an option:",
		//     reply_markup: JSON.stringify(keyboard),
		// });
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

			// sendTo(`${adapterName}`, "send", {
			//     chatId: chatId,
			//     text: "You selected First Level 1. Please select a sub-option:",
			//     reply_markup: JSON.stringify(keyboard),
			// });
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

			// sendTo(`${adapterName}`, "send", {
			//     chatId: chatId,
			//     text: "Please select an option:",
			//     reply_markup: JSON.stringify(keyboard),
			// });
			return ["Please select an option:", JSON.stringify(keyboard)];
		}
	}
}
module.exports = {
	specialMenu,
};
