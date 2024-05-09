const { decomposeText } = require("./utilities");
const { sendToTelegram } = require("./telegram");
const setDynamicValueObj: SetDynamicValueObj = {};
const setDynamicValue = (_this: any, returnText: string, ack: boolean, id: string, userToSend: string, telegramInstance: string, one_time_keyboard: boolean, resize_keyboard: boolean, userListWithChatID: UserListWithChatId[], parse_mode: BooleanString, confirm: string) => {
	const { substring } = decomposeText(returnText, "{setDynamicValue:", "}");
	const array = substring.split(":");
	const text = array[1];
	if (text) sendToTelegram(_this, userToSend, text, undefined, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID, parse_mode);
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
	if (array[3] && array[3] != "") return array[3];
};
/**
 *
 * @param {string} userToSend
 * @returns object with user Data
 */
const getDynamicValue = (userToSend: string) => {
	if (setDynamicValueObj[userToSend]) return setDynamicValueObj[userToSend];
	else return false;
};
const removeUserFromDynamicValue = (userToSend: string) => {
	if (setDynamicValueObj[userToSend]) delete setDynamicValueObj[userToSend];
};
module.exports = {
	setDynamicValue,
	getDynamicValue,
	removeUserFromDynamicValue,
};
