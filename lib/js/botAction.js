const { getChatID } = require("./utilities");
/**
 * Sends Request to delete a Message
 * @param {*} _this
 * @param {string} instance Instance of Telegram
 * @param {string} user User to send to
 * @param {[]} userListWithChatID Array with ChatID and Username
 * @param {string|number} messageId ID of the Message to delete
 */
const deleteMessageByBot = async (_this, instance, user, userListWithChatID, messageId, chat_id) => {
	try {
		_this.sendTo(instance, {
			deleteMessage: {
				options: {
					chat_id: chat_id,
					message_id: messageId,
				},
			},
		});
	} catch (e) {
		_this.log.error("Error deleteMessage: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
};
module.exports = {
	deleteMessageByBot,
};
