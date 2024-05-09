"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
 * @returns
 */
async function shoppingListSubscribeStateAndDeleteItem(_this, val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
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
                _this.log.debug("alexa-shoppinglist." + JSON.stringify(idList));
                await _subscribeAndUnSubscribeForeignStatesAsync([{ id: `alexa-shoppinglist.${idList}` }], _this, true);
                await _this.setForeignStateAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`, true, false);
            }
            else {
                sendToTelegram(_this, user, "Cannot delete the Item", undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "true");
                _this.log.debug("Cannot delete the Item");
                return;
            }
        }
    }
    catch (e) {
        _this.log.error("Error shoppingList: " + JSON.stringify(e.message));
        _this.log.error(JSON.stringify(e.stack));
    }
}
/**
 *
 * @param {*} _this
 * @param {*} instanceTelegram
 * @param {*} userListWithChatID
 * @param {*} userToSend
 */
async function deleteMessageAndSendNewShoppingList(_this, instanceTelegram, userListWithChatID, userToSend) {
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        _subscribeAndUnSubscribeForeignStatesAsync([{ id: `alexa-shoppinglist.${idList}` }], _this, false);
        await deleteMessageIds(_this, user, userListWithChatID, instanceTelegram, "last");
        const result = await _this.getForeignStateAsync("alexa-shoppinglist." + idList);
        if (result && result.val) {
            _this.log.debug("Result from Shoppinglist " + JSON.stringify(result));
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = createKeyboardFromJson(_this, result.val, null, newId, user);
            if (resultJson && resultJson.text && resultJson.keyboard)
                sendToTelegramSubmenu(_this, user, resultJson.text, resultJson.keyboard, instanceTelegram, userListWithChatID, "true");
        }
    }
    catch (e) {
        _this.log.error("Error deleteMessageAndSendNewShoppingList: " + JSON.stringify(e.message));
        _this.log.error(JSON.stringify(e.stack));
    }
}
module.exports = { shoppingListSubscribeStateAndDeleteItem, deleteMessageAndSendNewShoppingList };
//# sourceMappingURL=shoppingList.js.map