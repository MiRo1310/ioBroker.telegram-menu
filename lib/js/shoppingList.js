const { deleteMessageIds } = require("./messageIds.js");
const { createKeyboardFromJson } = require("./jsonTable.js");
const { sendToTelegramSubmenu, sendToTelegram } = require("./telegram.js");
const { _subscribeAndUnSubscribeForeignStatesAsync } = require("./subscribeStates.js");
const objData = {};
/**
 *
 * @param {*} _this
 * @param {*} val
 * @param {*} instanceTelegram
 * @param {*} userListWithChatID
 * @param {*} resize_keyboard
 * @param {*} one_time_keyboard
 * @param {boolean} newValue if false, the message will delete and it will be wait for newValue, if true, the new list was created
 * @returns
 */
async function shoppingList(_this, val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard, newValue, userToSend) {
	// [Michael]shoppingList:undefined:0_userdata.0.json
	try {
		let array, user, idList, instance, idItem, obj;
		if (val != null) {
			array = val.split(":");
			user = array[0].replace("[", "").replace("]sList", "");
			idList = array[1];
			instance = array[2];
			idItem = array[3];
			obj = await _this.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);
		}
		if (obj || newValue) {
			if (!newValue) {
				objData[user] = { idList: idList };
				_this.log.debug("alexa-shoppinglist." + JSON.stringify(idList));
				await _subscribeAndUnSubscribeForeignStatesAsync([{ id: `alexa-shoppinglist.${idList}` }], _this, true);
				await _this.setForeignStateAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`, true, false);
			}
			if (newValue) {
				user = userToSend;
				const idList = objData[user].idList;
				_subscribeAndUnSubscribeForeignStatesAsync([{ id: `alexa-shoppinglist.${idList}` }], _this, false);
				await deleteMessageIds(_this, user, userListWithChatID, instanceTelegram, "last");

				const result = await _this.getForeignStateAsync("alexa-shoppinglist." + idList);
				if (result && result.val) val = result.val;
				_this.log.debug("Result from Shoppinglist " + JSON.stringify(result));
				const newId = `alexa-shoppinglist.${idList}`;
				const resultJson = createKeyboardFromJson(_this, result.val, null, newId, user);
				if (resultJson && resultJson.text && resultJson.keyboard)
					sendToTelegramSubmenu(_this, user, resultJson.text, resultJson.keyboard, instanceTelegram, userListWithChatID, "true");
			}
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