const { deleteMessageByBot } = require("./telegram");

async function saveMessageIds(_this, state, instanceTelegram) {
	try {
		let requestMessageId;
		const requestUserIdObj = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
		const requestMessageIdObj = await _this.getStateAsync("communication.requestIds");
		if (requestUserIdObj && requestUserIdObj.val) {
			if (requestMessageIdObj.val) requestMessageId = JSON.parse(requestMessageIdObj.val);
			else requestMessageId = {};
			_this.log.debug("Save Message ID");
			if (!requestMessageId[requestUserIdObj.val]) requestMessageId[requestUserIdObj.val] = [];
			requestMessageId[requestUserIdObj.val].push({ id: state.val });
		}
		_this.log.debug("RequestMessageIds: " + JSON.stringify(requestMessageId));
		_this.setStateAsync("communication.requestIds", JSON.stringify(requestMessageId), true);
	} catch (e) {
		_this.log.error("Error saveMessageIds: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}

async function deleteMessageIds(_this, user, userListWithChatID, instanceTelegram, navToGoBack, resize_keyboard, one_time_keyboard, menuData, menus, part) {
	//FIXME - Letzte Nachricht mit löschen und Startseite aufrufen
	const requestMessageIdObj = await _this.getStateAsync("communication.requestIds");

	const lastMessageId = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);
	if (requestMessageIdObj && JSON.parse(requestMessageIdObj.val)) {
		const chat_id = getChatID(userListWithChatID, user);
		const messageIds = JSON.parse(requestMessageIdObj.val);
		messageIds[chat_id].push({ id: lastMessageId.val });

		messageIds[chat_id].forEach((element, index) => {
			deleteMessageByBot(_this, instanceTelegram, user, userListWithChatID, element.id);
		});
		messageIds[chat_id] = [];
		_this.setStateAsync("communication.requestIds", JSON.stringify(messageIds), true);
	}
}

const getChatID = (userListWithChatID, user) => {
	let chatId = "";
	userListWithChatID.forEach((element) => {
		if (element.name === user) chatId = element.chatID;
	});
	return chatId;
};

module.exports = {
	saveMessageIds,
	deleteMessageIds,
};
