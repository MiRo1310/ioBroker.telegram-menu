const { deleteMessageByBot } = require("./botAction");
const { getChatID } = require("./utilities");

/**
 * Saves MessageIds in State to delete them later
 * @param {*} _this
 * @param {object} state Received State
 * @param {string} instanceTelegram Instance of Telegram
 */
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

/**
 * Deletes Messages by Bot
 * @param {*} _this
 * @param {string} user Username
 * @param {[]} userListWithChatID Array with ChatID and Username
 * @param {string} instanceTelegram Instance of Telegram
 */
async function deleteMessageIds(_this, user, userListWithChatID, instanceTelegram) {
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

module.exports = {
	saveMessageIds,
	deleteMessageIds,
};
