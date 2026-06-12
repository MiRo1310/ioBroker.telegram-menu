import { isDefined } from '@backend/lib/utils';
import { _subscribeForeignStates } from '@backend/app/subscribeStates';
import { setstateIobroker } from '@backend/app/setstate';
import { sendToTelegram, sendToTelegramSubmenu } from '@backend/app/telegram';
import { deleteMessageIds } from '@backend/app/messageIds';
import { jsonString } from '@backend/lib/string';
import { createKeyboardFromJson, lastRequestJsonButtonHistory } from '@backend/app/jsonTable';
import type { AppContext } from '@backend/app/appContext';

interface ObjectData {
    [key: string]: {
        idList: string;
    };
}
class ShoppingListManager {
    private objData: ObjectData = {};
    private isSubscribed: boolean = false;

    public async subscribeStateAndDeleteItem(appContext: AppContext, val: string | null): Promise<number | undefined> {
        if (isDefined(val)) {
            const array = val.split(':');
            const user = array[0].replace('[', '').replace(']sList', '');
            const idList = array[1];
            const instance = array[2];
            const idItem = array[3];
            const list = array[4];
            const requestId = parseInt(array[5]);

            const res = await appContext.adapter.getForeignObjectAsync(
                `alexa2.${instance}.Lists.${list}.items.${idItem}`,
            );

            if (res) {
                this.objData[user] = { idList: idList };
                appContext.adapter.log.debug(`Alexa-shoppinglist : ${idList}`);
                if (!this.isSubscribed) {
                    //TODO check subscriber
                    await _subscribeForeignStates(appContext, `alexa-shoppinglist.${idList}`);
                    this.isSubscribed = true;
                }
                await setstateIobroker(
                    appContext,
                    `alexa2.${instance}.Lists.${list}.items.${idItem}.#delete`,
                    true,
                    false,
                );
                return requestId;
            }
            const telegramInstance = lastRequestJsonButtonHistory.getLast(requestId)?.instance;
            if (telegramInstance) {
                await sendToTelegram({
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

    public async deleteMessageAndSendNewShoppingList(
        instance: string,
        appContext: AppContext,
        userToSend: string,
    ): Promise<void> {
        const user = userToSend;
        const idList = this.objData[user].idList;
        await _subscribeForeignStates(appContext, `alexa-shoppinglist.${idList}`);
        await deleteMessageIds(instance, user, appContext, 'last');

        const result = await appContext.adapter.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result?.val) {
            appContext.adapter.log.debug(`Result from Shoppinglist : ${jsonString(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = createKeyboardFromJson(appContext, result.val as string, null, newId, user, instance);
            if (resultJson?.text && resultJson?.keyboard) {
                sendToTelegramSubmenu(instance, user, resultJson.text, resultJson.keyboard, appContext, true);
            }
        }
    }
}

export const shoppingListManager = new ShoppingListManager();
