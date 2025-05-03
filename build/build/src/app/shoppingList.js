"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.shoppingListSubscribeStateAndDeleteItem = shoppingListSubscribeStateAndDeleteItem;
exports.deleteMessageAndSendNewShoppingList = deleteMessageAndSendNewShoppingList;
const messageIds_js_1 = require("./messageIds.js");
const jsonTable_js_1 = require("./jsonTable.js");
const telegram_js_1 = require("./telegram.js");
const subscribeStates_js_1 = require("./subscribeStates.js");
const logging_js_1 = require("./logging.js");
const main_js_1 = require("../main.js");
const string_1 = require("../lib/string");
const objData = {};
let isSubscribed = false;
async function shoppingListSubscribeStateAndDeleteItem(val, instanceTelegram, userListWithChatID, resize_keyboard, one_time_keyboard) {
    try {
        let array, user, idList, instance, idItem, res;
        if (val != null) {
            array = val.split(':');
            user = array[0].replace('[', '').replace(']sList', '');
            idList = array[1];
            instance = array[2];
            idItem = array[3];
            res = await main_js_1._this.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);
            if (res) {
                objData[user] = { idList: idList };
                main_js_1._this.log.debug(`Alexa-shoppinglist: ${idList}`);
                if (!isSubscribed) {
                    await (0, subscribeStates_js_1._subscribeAndUnSubscribeForeignStatesAsync)({ id: `alexa-shoppinglist.${idList}` });
                    isSubscribed = true;
                }
                await main_js_1._this.setForeignStateAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`, true, false);
                return;
            }
            await (0, telegram_js_1.sendToTelegram)({
                user: user,
                textToSend: 'Cannot delete the Item',
                keyboard: undefined,
                instance: instanceTelegram,
                resize_keyboard: resize_keyboard,
                one_time_keyboard: one_time_keyboard,
                userListWithChatID: userListWithChatID,
                parse_mode: 'true',
            });
            main_js_1._this.log.debug('Cannot delete the Item');
            return;
        }
    }
    catch (e) {
        (0, logging_js_1.errorLogger)('Error shoppingList:', e);
    }
}
async function deleteMessageAndSendNewShoppingList(instanceTelegram, userListWithChatID, userToSend) {
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        await (0, subscribeStates_js_1._subscribeAndUnSubscribeForeignStatesAsync)({ id: `alexa-shoppinglist.${idList}` });
        await (0, messageIds_js_1.deleteMessageIds)(user, userListWithChatID, instanceTelegram, 'last');
        const result = await main_js_1._this.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result && result.val) {
            main_js_1._this.log.debug(`Result from Shoppinglist: ${(0, string_1.jsonString)(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = (0, jsonTable_js_1.createKeyboardFromJson)(result.val, null, newId, user);
            if (resultJson && resultJson.text && resultJson.keyboard) {
                (0, telegram_js_1.sendToTelegramSubmenu)(user, resultJson.text, resultJson.keyboard, instanceTelegram, userListWithChatID, 'true');
            }
        }
    }
    catch (e) {
        (0, logging_js_1.errorLogger)('Error deleteMessageAndSendNewShoppingList:', e);
    }
}
