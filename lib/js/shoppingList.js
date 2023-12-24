const { deleteMessageIds } = require("./messageIds.js");
const { createKeyboardFromJson } = require("./jsonTable.js");
const { sendToTelegramSubmenu, sendToTelegram } = require("./telegram.js");
async function shoppingList(_this, val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
	// [Michael]shoppingList:undefined:0_userdata.0.json
	try {
		const array = val.split(":");
		const user = array[0].replace("[", "").replace("]sList", "");
		const idList = array[1];
		const instance = array[2];
		const idItem = array[3];
		const obj = await _this.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);
		if (obj) {
			await _this.setForeignStateAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`, true, false);
			await deleteMessageIds(_this, user, userListWithChatID, instanceTelegram, "last");
			const result = await _this.getForeignStateAsync("alexa-shoppinglist." + idList);
			if (result && result.val) val = result.val;
			_this.log.debug("Result from Shoppinglist " + JSON.stringify(result));
			const resultJson = createKeyboardFromJson(_this, result.val, null, idList, user);
			if (resultJson && resultJson.text && resultJson.keyboard)
				sendToTelegramSubmenu(_this, user, resultJson.text, resultJson.keyboard, instanceTelegram, userListWithChatID, "true");
		} else {
			sendToTelegram(_this, user, "Cannot delete the Item", undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "true");
			_this.log.debug("Cannot delete the Item");
			return;
		}
	} catch (e) {
		_this.log.error("Error shoppingList: " + JSON.stringify(e.message));
		_this.log.error(JSON.stringify(e.stack));
	}
}
module.exports = { shoppingList };
