"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageAndSendNewShoppingList = exports.shoppingListSubscribeStateAndDeleteItem = void 0;
const messageIds_js_1 = require("./messageIds.js");
const jsonTable_js_1 = require("./jsonTable.js");
const telegram_js_1 = require("./telegram.js");
const subscribeStates_js_1 = require("./subscribeStates.js");
const logging_js_1 = require("./logging.js");
const main_js_1 = __importDefault(require("../../main.js"));
const objData = {};
async function shoppingListSubscribeStateAndDeleteItem(val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
    const _this = main_js_1.default.getInstance();
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
                (0, logging_js_1.debug)([{ text: "alexa-shoppinglist.", val: idList }]);
                await (0, subscribeStates_js_1._subscribeAndUnSubscribeForeignStatesAsync)({ id: `alexa-shoppinglist.${idList}` });
                await _this.setForeignStateAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`, true, false);
            }
            else {
                (0, telegram_js_1.sendToTelegram)(user, "Cannot delete the Item", undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "true");
                (0, logging_js_1.debug)([{ text: "Cannot delete the Item" }]);
                return;
            }
        }
    }
    catch (e) {
        (0, logging_js_1.error)([
            { text: "Error shoppingList:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.shoppingListSubscribeStateAndDeleteItem = shoppingListSubscribeStateAndDeleteItem;
async function deleteMessageAndSendNewShoppingList(instanceTelegram, userListWithChatID, userToSend) {
    const _this = main_js_1.default.getInstance();
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        (0, subscribeStates_js_1._subscribeAndUnSubscribeForeignStatesAsync)({ id: `alexa-shoppinglist.${idList}` });
        await (0, messageIds_js_1.deleteMessageIds)(user, userListWithChatID, instanceTelegram, "last");
        const result = await _this.getForeignStateAsync("alexa-shoppinglist." + idList);
        if (result && result.val) {
            (0, logging_js_1.debug)([{ text: "Result from Shoppinglist:", val: result }]);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = (0, jsonTable_js_1.createKeyboardFromJson)(result.val, null, newId, user);
            if (resultJson && resultJson.text && resultJson.keyboard)
                (0, telegram_js_1.sendToTelegramSubmenu)(user, resultJson.text, resultJson.keyboard, instanceTelegram, userListWithChatID, "true");
        }
    }
    catch (e) {
        (0, logging_js_1.error)([
            { text: "Error deleteMessageAndSendNewShoppingList:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.deleteMessageAndSendNewShoppingList = deleteMessageAndSendNewShoppingList;
//# sourceMappingURL=shoppingList.js.map