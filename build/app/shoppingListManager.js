"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shoppingListManager = void 0;
const utils_1 = require("../lib/utils");
const subscribeStates_1 = require("../app/subscribeStates");
const setstate_1 = require("../app/setstate");
const telegram_1 = require("../app/telegram");
const messageIds_1 = require("../app/messageIds");
const string_1 = require("../lib/string");
const jsonTable_1 = require("../app/jsonTable");
class ShoppingListManager {
    objData = {};
    isSubscribed = false;
    async subscribeStateAndDeleteItem(appContext, val) {
        if ((0, utils_1.isDefined)(val)) {
            const array = val.split(':');
            const user = array[0].replace('[', '').replace(']sList', '');
            const idList = array[1];
            const instance = array[2];
            const idItem = array[3];
            const list = array[4];
            const requestId = parseInt(array[5]);
            const res = await appContext.adapter.getForeignObjectAsync(`alexa2.${instance}.Lists.${list}.items.${idItem}`);
            if (res) {
                this.objData[user] = { idList: idList };
                appContext.adapter.log.debug(`Alexa-shoppinglist : ${idList}`);
                if (!this.isSubscribed) {
                    //TODO check subscriber
                    await (0, subscribeStates_1._subscribeForeignStates)(appContext, `alexa-shoppinglist.${idList}`);
                    this.isSubscribed = true;
                }
                await (0, setstate_1.setstateIobroker)({
                    appContext,
                    id: `alexa2.${instance}.Lists.${list}.items.${idItem}.#delete`,
                    value: true,
                    ack: false,
                });
                return requestId;
            }
            const telegramInstance = jsonTable_1.lastRequestJsonButtonHistory.getLast(requestId)?.instance;
            if (telegramInstance) {
                await (0, telegram_1.sendToTelegram)({
                    instance: telegramInstance,
                    userToSend: user,
                    textToSend: 'Cannot delete the Item',
                    appContext,
                    parse_mode: true,
                });
            }
            appContext.adapter.log.debug('Cannot delete the Item');
        }
    }
    async deleteMessageAndSendNewShoppingList(instance, appContext, userToSend) {
        const user = userToSend;
        const idList = this.objData[user].idList;
        await (0, subscribeStates_1._subscribeForeignStates)(appContext, `alexa-shoppinglist.${idList}`);
        await (0, messageIds_1.deleteMessageIds)(instance, user, appContext, 'last');
        const result = await appContext.adapter.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result?.val) {
            appContext.adapter.log.debug(`Result from Shoppinglist : ${(0, string_1.jsonString)(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = (0, jsonTable_1.createKeyboardFromJson)(appContext, result.val, null, newId, user, instance);
            if (resultJson?.text && resultJson?.keyboard) {
                (0, telegram_1.sendToTelegramSubmenu)(instance, user, resultJson.text, resultJson.keyboard, appContext, true);
            }
        }
    }
}
exports.shoppingListManager = new ShoppingListManager();
//# sourceMappingURL=shoppingListManager.js.map