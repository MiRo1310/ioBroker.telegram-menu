import { decomposeText } from "./utilities";
import { sendToTelegram } from "./telegram";
import { SetDynamicValueObj, UserListWithChatId, BooleanString, SetDynamicValue } from "./telegram-menu";
const setDynamicValueObj: SetDynamicValueObj = {};
const setDynamicValue = (
	returnText: string,
	ack: boolean,
	id: string,
	userToSend: string,
	telegramInstance: string,
	one_time_keyboard: boolean,
	resize_keyboard: boolean,
	userListWithChatID: UserListWithChatId[],
	parseMode: BooleanString,
	confirm: string,
): { confirmText: string; id: string | undefined } => {
	const { substring } = decomposeText(returnText, "{setDynamicValue:", "}");
	let array = substring.split(":");
	array = isBraceDeleteEntry(array);
	const text = array[1];
	if (text) {
		sendToTelegram(userToSend, text, undefined, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, parseMode);
	}
	setDynamicValueObj[userToSend] = {
		id: id,
		ack: ack,
		returnText: text,
		userToSend: userToSend,
		parseMode: parseMode,
		confirm: confirm,
		telegramInstance: telegramInstance,
		one_time_keyboard: one_time_keyboard,
		resize_keyboard: resize_keyboard,
		userListWithChatID: userListWithChatID,
		valueType: array[2],
	};

	if (array[3] && array[3] != "") {
		return { confirmText: array[3], id: array[4] };
	}
	return { confirmText: "", id: undefined };
};

const getDynamicValue = (userToSend: string): SetDynamicValue | null => {
	if (setDynamicValueObj[userToSend]) {
		return setDynamicValueObj[userToSend];
	}
	return null;
};
const removeUserFromDynamicValue = (userToSend: string): boolean => {
	if (setDynamicValueObj[userToSend]) {
		delete setDynamicValueObj[userToSend];
		return true;
	}
	return false;
};
export { setDynamicValue, getDynamicValue, removeUserFromDynamicValue };

function isBraceDeleteEntry(array: string[]): string[] {
	if (array[4] === "}") {
		return array.slice(0, 4);
	}
	return array;
}
