import { switchBack } from "./backMenu";
import { setState } from "./setstate";
import { sendToTelegram, sendToTelegramSubmenu } from "./telegram";
import { checkStatusInfo } from "./utilities";
import { _subscribeAndUnSubscribeForeignStatesAsync } from "./subscribeStates";
import { deleteMessageIds } from "./messageIds";
import { dynamicSwitch } from "./dynamicSwitch";
import { debug } from "./logging";
import { error } from "console";

let step = 0;
let returnIDToListenTo: SetStateIds[] = [];
let splittedData: SplittedData = [];

async function callSubMenu(
	calledValue: string,
	newObjectNavStructure: NewObjectNavStructure,
	userToSend: string,
	instanceTelegram: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
	part: Part,
	allMenusWithData: { [key: string]: NewObjectNavStructure },
	menus: string[],
	setStateIdsToListenTo: SetStateIds[] | null,
): Promise<{ setStateIdsToListenTo: SetStateIds[] | null; newNav: string | undefined } | undefined> {
	try {
		debug([{ text: "Type of:", val: typeof calledValue }]);
		const obj = await subMenu(
			calledValue,
			newObjectNavStructure,
			userToSend,
			instanceTelegram,
			resize_keyboard,
			one_time_keyboard,
			userListWithChatID,
			part,
			allMenusWithData,
			menus,
		);
		debug([{ text: "Submenu data:", val: obj }]);

		if (obj?.returnIds) {
			setStateIdsToListenTo = obj.returnIds;

			_subscribeAndUnSubscribeForeignStatesAsync({ array: obj.returnIds });
		}

		if (obj && typeof obj.text == "string" && obj.text && typeof obj.keyboard == "string") {
			sendToTelegramSubmenu(userToSend, obj.text, obj.keyboard, instanceTelegram, userListWithChatID, part.parse_mode || "false");
		}
		return { setStateIdsToListenTo: setStateIdsToListenTo, newNav: obj?.navToGoBack };
	} catch (e: any) {
		error({
			array: [
				{ text: "Error callSubMenu:", val: e.message },
				{ text: "Stack:", val: e.stack },
			],
		});
	}
}

async function subMenu(
	calledValue: string,
	menuData: NewObjectNavStructure,
	userToSend: string,
	instanceTelegram: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
	part: Part,
	allMenusWithData: { [key: string]: NewObjectNavStructure },
	menus: string[],
): Promise<{ text?: string; keyboard?: string; device?: string; returnIds?: SetStateIds[]; navToGoBack?: string } | undefined> {
	try {
		debug([{ text: "CalledValue:", val: calledValue }]);
		let text: string | undefined = "";
		if (part && part.text && part.text != "") {
			text = await checkStatusInfo(part.text);
		}
		let splittedText = [];
		let callbackData = "";
		let device2Switch: string = "";
		if (calledValue.includes('"')) {
			splittedText = calledValue.split(`"`)[1].split(":");
		} else {
			splittedText = calledValue.split(":");
		}
		device2Switch = splittedText[2];
		callbackData = splittedText[1];

		debug([
			{ text: "CallbackData:", val: callbackData },
			{ text: "Device2Switch:", val: device2Switch },
			{ text: "SplittedText:", val: splittedText },
		]);

		if (callbackData.includes("delete")) {
			const navToGoBack = splittedText[2];
			if (callbackData.includes("deleteAll")) {
				deleteMessageIds(userToSend, userListWithChatID, instanceTelegram, "all");
			}
			if (navToGoBack && navToGoBack != "") {
				return { navToGoBack: navToGoBack };
			} else {
				debug([{ text: "Please insert a Menu in your Delete Submenu" }]);
			}
			return;
		} else if (callbackData.includes("switch")) {
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
			return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
		} else if (callbackData.includes("first")) {
			let val;
			debug([{ text: "SplittedData:", val: splittedData }]);
			if (splittedData[1].split(".")[1] == "false") {
				val = false;
			} else if (splittedData[1].split(".")[1] == "true") {
				val = true;
			} else {
				val = splittedData[1].split(".")[1];
			}
			const result = await setState(
				menuData[device2Switch],
				userToSend,
				val as string,
				true,
				instanceTelegram,
				resize_keyboard,
				one_time_keyboard,
				userListWithChatID,
			);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return { returnIds: returnIDToListenTo };
		} else if (callbackData.includes("second")) {
			let val;
			if (splittedData[2].split(".")[1] == "false") {
				val = false;
			} else if (splittedData[2].split(".")[1] == "true") {
				val = true;
			} else {
				val = splittedData[2].split(".")[1];
			}
			const result = await setState(
				menuData[device2Switch],
				userToSend,
				val as string,
				true,
				instanceTelegram,
				resize_keyboard,
				one_time_keyboard,
				userListWithChatID,
			);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return { returnIds: returnIDToListenTo };
		} else if (callbackData.includes("dynSwitch")) {
			return dynamicSwitch(calledValue, device2Switch, text as string);
		} else if (callbackData.includes("dynS")) {
			debug([{ text: "SplittedData:", val: splittedData }]);
			const val = splittedText[3];
			const result = await setState(
				menuData[device2Switch],
				userToSend,
				val,
				true,
				instanceTelegram,
				resize_keyboard,

				one_time_keyboard,
				userListWithChatID,
			);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return {
				returnIds: returnIDToListenTo,
			};
		} else if (!calledValue.includes("submenu") && callbackData.includes("percent")) {
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
			return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
		} else if (calledValue.includes(`submenu:percent${step}`)) {
			const value = parseInt(calledValue.split(":")[1].split(",")[1]);

			const result = await setState(
				menuData[device2Switch],
				userToSend,
				value,
				true,
				instanceTelegram,
				resize_keyboard,
				one_time_keyboard,
				userListWithChatID,
			);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return { returnIds: returnIDToListenTo };
		} else if (!calledValue.includes("submenu") && callbackData.includes("number")) {
			if (callbackData.includes("(-)")) callbackData = callbackData.replace("(-)", "negativ");
			const splittedData = callbackData.replace("number", "").split("-");
			let rowEntries = 0;
			let menu = [];
			const keyboard = {
				inline_keyboard: [] as any[],
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
					keyboard.inline_keyboard.push(menu);
					menu = [];
					rowEntries = 0;
				}
			}

			if (rowEntries != 0) keyboard.inline_keyboard.push(menu);
			debug([{ text: "keyboard:", val: keyboard.inline_keyboard }]);
			return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
		} else if (calledValue.includes(`submenu:${callbackData}`)) {
			debug([{ text: "CallbackData:", val: callbackData }]);

			const value = parseFloat(calledValue.split(":")[3]);
			device2Switch = calledValue.split(":")[2];

			const result = await setState(
				menuData[device2Switch],
				userToSend,
				value,
				true,
				instanceTelegram,
				resize_keyboard,
				one_time_keyboard,
				userListWithChatID,
			);
			if (Array.isArray(result)) returnIDToListenTo = result;
			return { returnIds: returnIDToListenTo };
		} else if (callbackData === "back") {
			const result = await switchBack(userToSend, allMenusWithData, menus);
			if (result)
				sendToTelegram(
					userToSend,
					result["texttosend"] as string,
					result["menuToSend"],
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					result["parseMode"],
				);
		}
		return;
	} catch (error: any) {
		error([
			{ text: "Error subMenu:", val: error.message },
			{ text: "Stack", val: error.stack },
		]);
	}
}

export { subMenu, callSubMenu };
