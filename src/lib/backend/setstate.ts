import { sendToTelegram } from "./telegram";
import { checkTypeOfId } from "./utilities";
import { setDynamicValue } from "./dynamicValue";
import { decomposeText } from "./global";
import TelegramMenu from "../../main";
import { debug, error } from "./logging";

const modifiedValue = (valueFromSubmenu: string, value: string): string => {
	if (value && typeof value === "string" && value.includes("{value}")) {
		return value.replace("{value}", valueFromSubmenu);
	}
	return valueFromSubmenu;
};
const isDynamicValueToSet = async (value: string | number | boolean): Promise<string | number | boolean> => {
	const _this = TelegramMenu.getInstance();
	if (typeof value === "string" && value.includes("{id:")) {
		const result = decomposeText(value, "{id:", "}");
		const id = result.substring.replace("{id:", "").replace("}", "");
		const newValue = await _this.getForeignStateAsync(id);
		if (newValue && newValue.val && typeof newValue.val === "string") {
			return value.replace(result.substring, newValue.val);
		}
	}
	return value;
};
const setValue = async (id: string, value: string, SubmenuValuePriority: boolean, valueFromSubmenu: string | number, ack: boolean): Promise<void> => {
	try {
		const _this = TelegramMenu.getInstance();
		let valueToSet;
		SubmenuValuePriority ? (valueToSet = modifiedValue(valueFromSubmenu as string, value)) : (valueToSet = await isDynamicValueToSet(value));
		await checkTypeOfId(id, valueToSet).then((val: ioBroker.StateValue | ioBroker.SettableState | undefined) => {
			valueToSet = val;
			debug([{ text: "Value to Set:", val: valueToSet }]);
			if (valueToSet !== undefined && valueToSet !== null) {
				_this.setForeignState(id, valueToSet, ack);
			}
		});
	} catch (error: any) {
		error([
			{ text: "Error setValue", val: error.message },
			{ text: "Stack", val: error.stack },
		]);
	}
};

export const setState = async (
	part: Part,
	userToSend: string,
	valueFromSubmenu: string | number,
	SubmenuValuePriority: boolean,
	telegramInstance: string,
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
): Promise<SetStateIds[] | undefined> => {
	const _this = TelegramMenu.getInstance();
	try {
		const setStateIds: SetStateIds[] = [];
		part.switch?.forEach((element) => {
			debug([{ text: "Element to set:", val: element }]);
			let ack = false;
			let returnText = element.returnText;

			debug([{ text: "Set ack:", val: element["ack"] }]);

			ack = element?.ack ? element.ack === "true" : false;

			if (returnText.includes("{setDynamicValue")) {
				const { confirmText, id } = setDynamicValue(
					returnText,
					ack,
					element.id,
					userToSend,
					telegramInstance,
					one_time_keyboard,
					resize_keyboard,
					userListWithChatID,
					element.parse_mode,
					element.confirm,
				);

				if (element.confirm) {
					return setStateIds.push({
						id: id || element.id,
						confirm: element.confirm,
						returnText: confirmText as string,
						userToSend: userToSend,
					});
				}
			}

			if (!returnText.includes("{'id':'")) {
				setStateIds.push({
					id: element.id,
					confirm: element.confirm,
					returnText: returnText,
					userToSend: userToSend,
					parse_mode: element.parse_mode,
				});
				debug([{ text: "SetStateIds:", val: setStateIds }]);
			} else {
				try {
					debug([{ text: "ReturnText:", val: returnText }]);
					returnText = returnText.replaceAll("'", '"');
					const textToSend = returnText.slice(0, returnText.indexOf("{")).trim();
					const returnObj = JSON.parse(returnText.slice(returnText.indexOf("{"), returnText.indexOf("}") + 1));

					returnObj.text = returnObj.text + returnText.slice(returnText.indexOf("}") + 1);
					if (textToSend && textToSend !== "") {
						sendToTelegram(
							userToSend,
							textToSend,
							undefined,
							telegramInstance,
							one_time_keyboard,
							resize_keyboard,
							userListWithChatID,
							element.parse_mode,
						);
					}

					debug([{ text: "JSON parse:", val: returnObj }]);
					setStateIds.push({
						id: returnObj.id,
						confirm: true,
						returnText: returnObj.text,
						userToSend: userToSend,
					});
					debug([{ text: "SetStateIds", val: setStateIds }]);
				} catch (e: any) {
					error([
						{ text: "Error parsing returnObj:", val: e.message },
						{ text: "Stack:", val: e.stack },
					]);
				}
			}
			if (element.toggle) {
				debug([{ text: "Toggle" }]);
				_this
					.getForeignStateAsync(element.id)
					.then((val) => {
						if (val) {
							_this.setForeignStateAsync(element.id, !val.val, ack);
						}
					})
					.catch((e: any) => {
						error([
							{ text: "Error", val: e.message },
							{ text: "Stack", val: e.stack },
						]);
					});
			} else {
				setValue(element.id, element.value, SubmenuValuePriority, valueFromSubmenu, ack);
			}
		});
		return setStateIds;
	} catch (error: any) {
		error([
			{ text: "Error Switch", val: error.message },
			{ text: "Stack", val: error.stack },
		]);
	}
};
