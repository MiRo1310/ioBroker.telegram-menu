/**
 * Sends Request to delete a Message
 * @param {*} _this
 * @param {string} instance Instance of Telegram
 * @param {string} user User to send to
 * @param {[]} userListWithChatID Array with ChatID and Username
 * @param {string|number} messageId ID of the Message to delete
 * @param {string|number} chat_id ChatID of the User
 */
const deleteMessageByBot = async (_this: any, instance: string, user: string, userListWithChatID: UserListWithChatId[], messageId: number, chat_id: string | number) => {
	try {
		if (chat_id) {
			_this.log.debug("Delete Message for " + JSON.stringify(user + " " + chat_id));
		}
		_this.sendTo(instance, {
			// user: user,
			deleteMessage: {
				options: {
					chat_id: chat_id,
					message_id: messageId,
				},
			},
		});
	} catch (e: any) {
		_this.log.error("Error deleteMessage: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
};
module.exports = {
	deleteMessageByBot,
};
