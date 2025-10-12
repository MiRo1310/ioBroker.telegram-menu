import { deleteMessageIds } from './messageIds';
import { createKeyboardFromJson } from './jsonTable';
import { sendToTelegram, sendToTelegramSubmenu } from './telegram';
import { _subscribeForeignStates } from './subscribeStates';
import { errorLogger } from './logging';
import type { TelegramParams } from '../types/types';
import { jsonString } from '../lib/string';
import { setstateIobroker } from './setstate';
import { toJson } from '../lib/json';
import { isDefined } from '../lib/utils';

interface ObjectData {
    [key: string]: {
        idList: string;
    };
}
const objData: ObjectData = {};

let isSubscribed = false;

export async function shoppingListSubscribeStateAndDeleteItem(
    telegramInstance: string,
    val: string | null,
    telegramParams: TelegramParams,
): Promise<void> {
    const adapter = telegramParams.adapter;
    try {
        let array, user, idList, instance, idItem, res;
        if (isDefined(val)) {
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
                    await _subscribeForeignStates(adapter, `alexa-shoppinglist.${idList}`);
                    isSubscribed = true;
                }
                await setstateIobroker({
                    adapter,
                    id: `alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`,
                    value: true,
                    ack: false,
                });
                return;
            }
            await sendToTelegram({
                instance: telegramInstance,
                userToSend: user,
                textToSend: 'Cannot delete the Item',
                telegramParams,
                parse_mode: true,
            });
            adapter.log.debug('Cannot delete the Item');
        }
    } catch (e: any) {
        errorLogger('Error shoppingList:', e, adapter);
    }
}

export async function deleteMessageAndSendNewShoppingList(
    instance: string,
    telegramParams: TelegramParams,
    userToSend: string,
): Promise<void> {
    const adapter = telegramParams.adapter;
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        await _subscribeForeignStates(adapter, `alexa-shoppinglist.${idList}`);
        await deleteMessageIds(instance, user, telegramParams, 'last');

        const result = await adapter.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result?.val) {
            adapter.log.debug(`Result from Shoppinglist : ${jsonString(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = createKeyboardFromJson(adapter, toJson(result.val), null, newId, user);
            if (resultJson?.text && resultJson?.keyboard) {
                sendToTelegramSubmenu(instance, user, resultJson.text, resultJson.keyboard, telegramParams, true);
            }
        }
    } catch (e: any) {
        errorLogger('Error deleteMessageAndSendNewShoppingList', e, adapter);
    }
}
