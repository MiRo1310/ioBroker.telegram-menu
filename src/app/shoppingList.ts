import { isDefined } from '@backend/lib/utils';
import { _subscribeForeignStates } from '@backend/app/subscribeStates';
import { setstateIobroker } from '@backend/app/setstate';
import { sendToTelegram, sendToTelegramSubmenu } from '@backend/app/telegram';
import { errorLogger } from '@backend/app/logging';
import { deleteMessageIds } from '@backend/app/messageIds';
import { jsonString } from '@backend/lib/string';
import { createKeyboardFromJson, lastRequestJsonButtonHistory } from '@backend/app/jsonTable';
import type { AppContext } from '@backend/app/appContext';

interface ObjectData {
    [key: string]: {
        idList: string;
    };
}
const objData: ObjectData = {};

let isSubscribed = false;

export async function shoppingListSubscribeStateAndDeleteItem(
    appContext: AppContext,
    val: string | null,
): Promise<number | undefined> {
    try {
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
                objData[user] = { idList: idList };
                appContext.adapter.log.debug(`Alexa-shoppinglist : ${idList}`);
                if (!isSubscribed) {
                    //TODO check subscriber
                    await _subscribeForeignStates(appContext, `alexa-shoppinglist.${idList}`);
                    isSubscribed = true;
                }
                await setstateIobroker({
                    appContext,
                    id: `alexa2.${instance}.Lists.${list}.items.${idItem}.#delete`,
                    value: true,
                    ack: false,
                });
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
    } catch (e: any) {
        errorLogger('Error shoppingList:', e, appContext.adapter);
    }
}

export async function deleteMessageAndSendNewShoppingList(
    instance: string,
    appContext: AppContext,
    userToSend: string,
): Promise<void> {
    try {
        const user = userToSend;
        const idList = objData[user].idList;
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
    } catch (e: any) {
        errorLogger('Error deleteMessageAndSendNewShoppingList', e, appContext.adapter);
    }
}
