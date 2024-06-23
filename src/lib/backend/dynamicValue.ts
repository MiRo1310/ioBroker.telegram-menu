import { decomposeText } from "./utilities";
import { sendToTelegram } from "./telegram";
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
	parse_mode: BooleanString,
	confirm: string,
): { confirmText: string; id: string | undefined } => {
	const { substring } = decomposeText(returnText, "{setDynamicValue:", "}");
	const array = substring.split(":");
	const text = array[1];
	if (text) {
		sendToTelegram(userToSend, text, undefined, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, parse_mode);
	}
	const obj = {
		id: id,
		ack: ack,
		returnText: text,
		userToSend: userToSend,
		parse_mode: parse_mode,
		confirm: confirm,
		telegramInstance: telegramInstance,
		one_time_keyboard: one_time_keyboard,
		resize_keyboard: resize_keyboard,
		userListWithChatID: userListWithChatID,
		valueType: array[2],
	};
	setDynamicValueObj[userToSend] = obj;
	if (array[3] && array[3] != "") {
		return { confirmText: array[3], id: array[4] };
	}
	return { confirmText: "", id: undefined };
};

const getDynamicValue = (userToSend: string): SetDynamicValue | null => {
	if (setDynamicValueObj[userToSend]) {
		return setDynamicValueObj[userToSend];
	} else {
		return null;
	}
};
const removeUserFromDynamicValue = (userToSend: string): void => {
	if (setDynamicValueObj[userToSend]) {
		delete setDynamicValueObj[userToSend];
	}
};
export { setDynamicValue, getDynamicValue, removeUserFromDynamicValue };
