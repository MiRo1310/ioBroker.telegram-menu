"use strict";
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
const setstate_1 = require("./setstate");
const json_1 = require("../lib/json");
const utils_1 = require("../lib/utils");
const objData = {};
let isSubscribed = false;
async function shoppingListSubscribeStateAndDeleteItem(telegramInstance, val, telegramParams) {
    try {
        let array, user, idList, instance, idItem, res;
        if ((0, utils_1.isDefined)(val)) {
            array = val.split(':');
            user = array[0].replace('[', '').replace(']sList', '');
            idList = array[1];
            instance = array[2];
            idItem = array[3];
            res = await main_js_1.adapter.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);
            if (res) {
                objData[user] = { idList: idList };
                main_js_1.adapter.log.debug(`Alexa-shoppinglist : ${idList}`);
                if (!isSubscribed) {
                    await (0, subscribeStates_js_1._subscribeForeignStates)(`alexa-shoppinglist.${idList}`);
                    isSubscribed = true;
                }
                await (0, setstate_1.setstateIobroker)({
                    id: `alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`,
                    value: true,
                    ack: false,
                });
                return;
            }
            await (0, telegram_js_1.sendToTelegram)({
                instance: telegramInstance,
                userToSend: user,
                textToSend: 'Cannot delete the Item',
                telegramParams,
                parse_mode: true,
            });
            main_js_1.adapter.log.debug('Cannot delete the Item');
        }
    }
    catch (e) {
        (0, logging_js_1.errorLogger)('Error shoppingList:', e, main_js_1.adapter);
    }
}
async function deleteMessageAndSendNewShoppingList(instance, telegramParams, userToSend) {
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        await (0, subscribeStates_js_1._subscribeForeignStates)(`alexa-shoppinglist.${idList}`);
        await (0, messageIds_js_1.deleteMessageIds)(instance, user, telegramParams, 'last');
        const result = await main_js_1.adapter.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result?.val) {
            main_js_1.adapter.log.debug(`Result from Shoppinglist : ${(0, string_1.jsonString)(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = (0, jsonTable_js_1.createKeyboardFromJson)((0, json_1.toJson)(result.val), null, newId, user);
            if (resultJson?.text && resultJson?.keyboard) {
                (0, telegram_js_1.sendToTelegramSubmenu)(instance, user, resultJson.text, resultJson.keyboard, telegramParams, true);
            }
        }
    }
    catch (e) {
        (0, logging_js_1.errorLogger)('Error deleteMessageAndSendNewShoppingList', e, main_js_1.adapter);
    }
}
//# sourceMappingURL=shoppingList.js.map