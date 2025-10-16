"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shoppingListSubscribeStateAndDeleteItem = shoppingListSubscribeStateAndDeleteItem;
exports.deleteMessageAndSendNewShoppingList = deleteMessageAndSendNewShoppingList;
const utils_1 = require("../lib/utils");
const subscribeStates_1 = require("../app/subscribeStates");
const setstate_1 = require("../app/setstate");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
const messageIds_1 = require("../app/messageIds");
const string_1 = require("../lib/string");
const jsonTable_1 = require("../app/jsonTable");
const json_1 = require("../lib/json");
const objData = {};
let isSubscribed = false;
async function shoppingListSubscribeStateAndDeleteItem(telegramInstance, val, telegramParams) {
    const adapter = telegramParams.adapter;
    try {
        let array, user, idList, instance, idItem, res;
        if ((0, utils_1.isDefined)(val)) {
            array = val.split(':');
            user = array[0].replace('[', '').replace(']sList', '');
            idList = array[1];
            instance = array[2];
            idItem = array[3];
            res = await adapter.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);
            if (res) {
                objData[user] = { idList: idList };
                adapter.log.debug(`Alexa-shoppinglist : ${idList}`);
                if (!isSubscribed) {
                    await (0, subscribeStates_1._subscribeForeignStates)(adapter, `alexa-shoppinglist.${idList}`);
                    isSubscribed = true;
                }
                await (0, setstate_1.setstateIobroker)({
                    adapter,
                    id: `alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`,
                    value: true,
                    ack: false,
                });
                return;
            }
            await (0, telegram_1.sendToTelegram)({
                instance: telegramInstance,
                userToSend: user,
                textToSend: 'Cannot delete the Item',
                telegramParams,
                parse_mode: true,
            });
            adapter.log.debug('Cannot delete the Item');
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error shoppingList:', e, adapter);
    }
}
async function deleteMessageAndSendNewShoppingList(instance, telegramParams, userToSend) {
    const adapter = telegramParams.adapter;
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        await (0, subscribeStates_1._subscribeForeignStates)(adapter, `alexa-shoppinglist.${idList}`);
        await (0, messageIds_1.deleteMessageIds)(instance, user, telegramParams, 'last');
        const result = await adapter.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result?.val) {
            adapter.log.debug(`Result from Shoppinglist : ${(0, string_1.jsonString)(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = (0, jsonTable_1.createKeyboardFromJson)(adapter, (0, json_1.toJson)(result.val), null, newId, user);
            if (resultJson?.text && resultJson?.keyboard) {
                (0, telegram_1.sendToTelegramSubmenu)(instance, user, resultJson.text, resultJson.keyboard, telegramParams, true);
            }
        }
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error deleteMessageAndSendNewShoppingList', e, adapter);
    }
}
//# sourceMappingURL=shoppingList.js.map