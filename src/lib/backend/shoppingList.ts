import { deleteMessageIds } from "./messageIds.js";
import { createKeyboardFromJson } from "./jsonTable.js";
import { sendToTelegramSubmenu, sendToTelegram } from "./telegram.js";
import { _subscribeAndUnSubscribeForeignStatesAsync } from "./subscribeStates.js";
import { debug, error } from "./logging.js";
import TelegramMenu from "../../main.js";

interface ObjectData {
	[key: string]: {
		idList: string;
	};
}
const objData: ObjectData = {};

async function shoppingListSubscribeStateAndDeleteItem(
	val: string | null,
	instanceTelegram: string,
	userListWithChatID: UserListWithChatId[],
	resize_keyboard: boolean,
	one_time_keyboard: boolean,
): Promise<void> {
	const _this = TelegramMenu.getInstance();
	try {
		let array, user, idList, instance, idItem, res;
		if (val != null) {
			array = val.split(":");
			user = array[0].replace("[", "").replace("]sList", "");
			idList = array[1];
			instance = array[2];
			idItem = array[3];
			res = await _this.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);

			if (res) {
				objData[user] = { idList: idList };
				debug([{ text: "alexa-shoppinglist.", val: idList }]);
				await _subscribeAndUnSubscribeForeignStatesAsync({ id: `alexa-shoppinglist.${idList}` });
				await _this.setForeignStateAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`, true, false);
			} else {
				sendToTelegram(
					user,
					"Cannot delete the Item",
					undefined,
					instanceTelegram,
					resize_keyboard,
					one_time_keyboard,
					userListWithChatID,
					"true",
				);
				debug([{ text: "Cannot delete the Item" }]);
				return;
			}
		}
	} catch (e: any) {
		error([
			{ text: "Error shoppingList:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
}

async function deleteMessageAndSendNewShoppingList(
	instanceTelegram: string,
	userListWithChatID: UserListWithChatId[],
	userToSend: string,
): Promise<void> {
	const _this = TelegramMenu.getInstance();
	try {
		const user = userToSend;
		const idList = objData[user].idList;
		_subscribeAndUnSubscribeForeignStatesAsync({ id: `alexa-shoppinglist.${idList}` });
		await deleteMessageIds(user, userListWithChatID, instanceTelegram, "last");

		const result = await _this.getForeignStateAsync("alexa-shoppinglist." + idList);
		if (result && result.val) {
			debug([{ text: "Result from Shoppinglist:", val: result }]);
			const newId = `alexa-shoppinglist.${idList}`;
			const resultJson = createKeyboardFromJson(result.val as string, null, newId, user);
			if (resultJson && resultJson.text && resultJson.keyboard) {
				sendToTelegramSubmenu(user, resultJson.text, resultJson.keyboard, instanceTelegram, userListWithChatID, "true");
			}
		}
	} catch (e: any) {
		error([
			{ text: "Error deleteMessageAndSendNewShoppingList:", val: e.message },
			{ text: "Stack:", val: e.stack },
		]);
	}
}

export { shoppingListSubscribeStateAndDeleteItem, deleteMessageAndSendNewShoppingList };
