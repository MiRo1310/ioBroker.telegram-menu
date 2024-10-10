import TelegramMenu from "../main";
import { debug, error } from "./logging";
import { UserListWithChatId } from "./telegram-menu";

const deleteMessageByBot = async (
	instance: string,
	user: string,
	userListWithChatID: UserListWithChatId[],
	messageId: number,
	chat_id: string | number,
): Promise<void> => {
	const _this = TelegramMenu.getInstance();
	try {
		if (chat_id) {
			debug([{ text: "Delete Message for", val: user + " " + chat_id + " , MessageId: " + messageId }]);
		}
		_this.sendTo(instance, {
			deleteMessage: {
				options: {
					chat_id: chat_id,
					message_id: messageId,
				},
			},
		});
	} catch (e: any) {
		error([
			{ text: "Error deleteMessage:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
};
export { deleteMessageByBot };
