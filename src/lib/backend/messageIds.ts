import TelegramMenu from "@backend/main";
import { deleteMessageByBot } from "./botAction";
import { getChatID } from "./utilities";
import { error } from "./logging";

async function saveMessageIds(state: ioBroker.State, instanceTelegram: string): Promise<void> {
	const _this = TelegramMenu.getInstance();
	try {
		let requestMessageId;
		const requestUserIdObj = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
		const requestMessageIdObj = await _this.getStateAsync("communication.requestIds");
		if (requestMessageIdObj && requestUserIdObj && requestUserIdObj.val) {
			if (requestMessageIdObj.val) {
				requestMessageId = JSON.parse(requestMessageIdObj.val.toString());
			} else {
				requestMessageId = {};
			}

			if (typeof requestUserIdObj.val === "string" && !requestMessageId[requestUserIdObj.val]) {
				requestMessageId[requestUserIdObj.val] = [];
			}
			if (typeof requestUserIdObj.val === "string") {
				requestMessageId[requestUserIdObj.val].push({ id: state.val, time: Date.now() });
				requestMessageId = removeOldMessageIds(requestMessageId, requestUserIdObj.val);
			}
		}
	} catch (e: any) {
		error([
			{ text: "Error saveMessageIds:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
}
function removeOldMessageIds(messages: Messages, chatID: string): Messages {
	messages[chatID] = messages[chatID].filter((message) => {
		return message.time && message.time > Date.now() - 1000 * 60 * 60 * 24 * 2;
	});
	return messages;
}

async function deleteMessageIds(
	user: string,
	userListWithChatID: UserListWithChatId[],
	instanceTelegram: string,
	whatShouldDelete: WhatShouldDelete,
): Promise<void> {
	const _this = TelegramMenu.getInstance();
	try {
		const requestMessageIdObj = await _this.getStateAsync("communication.requestIds");
		const lastMessageId = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);
		if (requestMessageIdObj && typeof requestMessageIdObj.val === "string" && JSON.parse(requestMessageIdObj.val)) {
			const chat_id = getChatID(userListWithChatID, user);
			const messageIds = JSON.parse(requestMessageIdObj.val);
			messageIds[chat_id].push({ id: lastMessageId?.val });
			const newMessageIds = messageIds;
			for (let i = messageIds[chat_id].length - 1; i >= 0; i--) {
				if (whatShouldDelete === "all") {
					deleteMessageByBot(instanceTelegram, user, userListWithChatID, messageIds[chat_id][i].id, chat_id);
					newMessageIds[chat_id].splice(i, 1);
				} else if (whatShouldDelete === "last" && i === messageIds[chat_id].length - 1) {
					deleteMessageByBot(instanceTelegram, user, userListWithChatID, messageIds[chat_id][i].id, chat_id);
					messageIds[chat_id] = messageIds[chat_id].slice(i, 1);
				}
				// else if (whatShouldDelete === "leaveL" && leaveLastStanding && i > leaveLastStanding - 1) {
				// 	deleteMessageByBot(_this, instanceTelegram, user, userListWithChatID, messageIds[chat_id][i].id, chat_id);
				// 	newMessageIds[chat_id].splice(i, 1);
				// }
			}

			_this.setStateAsync("communication.requestIds", JSON.stringify(newMessageIds), true);
		}
	} catch (e: any) {
		error([
			{ text: "Error deleteMessageIds:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
}

export { saveMessageIds, deleteMessageIds };
