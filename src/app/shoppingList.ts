import { deleteMessageIds } from './messageIds.js';
import { createKeyboardFromJson } from './jsonTable.js';
import { sendToTelegram, sendToTelegramSubmenu } from './telegram.js';
import { _subscribeAndUnSubscribeForeignStatesAsync } from './subscribeStates.js';
import { errorLogger } from './logging.js';
import { adapter } from '../main.js';
import type { UserListWithChatId } from '../types/types.js';
import { jsonString } from '../lib/string';
import { setstateIobroker } from './setstate';

interface ObjectData {
    [key: string]: {
        idList: string;
    };
}
const objData: ObjectData = {};

let isSubscribed = false;

export async function shoppingListSubscribeStateAndDeleteItem(
    val: string | null,
    instanceTelegram: string,
    userListWithChatID: UserListWithChatId[],
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
): Promise<void> {
    try {
        let array, user, idList, instance, idItem, res;
        if (val != null) {
            array = val.split(':');
            user = array[0].replace('[', '').replace(']sList', '');
            idList = array[1];
            instance = array[2];
            idItem = array[3];
            res = await adapter.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);

            if (res) {
                objData[user] = { idList: idList };
                adapter.log.debug(`Alexa-shoppinglist: ${idList}`);
                if (!isSubscribed) {
                    await _subscribeAndUnSubscribeForeignStatesAsync({ id: `alexa-shoppinglist.${idList}` });
                    isSubscribed = true;
                }
                await setstateIobroker({
                    id: `alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`,
                    value: true,
                    ack: false,
                });
                return;
            }
            await sendToTelegram({
                userToSend: user,
                textToSend: 'Cannot delete the Item',
                telegramInstance: instanceTelegram,
                resize_keyboard: resize_keyboard,
                one_time_keyboard: one_time_keyboard,
                userListWithChatID: userListWithChatID,
                parse_mode: true,
            });
            adapter.log.debug('Cannot delete the Item');
            return;
        }
    } catch (e: any) {
        errorLogger('Error shoppingList:', e, adapter);
    }
}

export async function deleteMessageAndSendNewShoppingList(
    instanceTelegram: string,
    userListWithChatID: UserListWithChatId[],
    userToSend: string,
): Promise<void> {
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        await _subscribeAndUnSubscribeForeignStatesAsync({ id: `alexa-shoppinglist.${idList}` });
        await deleteMessageIds(user, userListWithChatID, instanceTelegram, 'last');

        const result = await adapter.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result?.val) {
            adapter.log.debug(`Result from Shoppinglist: ${jsonString(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = createKeyboardFromJson(JSON.stringify(result.val, null, 2), null, newId, user);
            if (resultJson?.text && resultJson?.keyboard) {
                sendToTelegramSubmenu(
                    user,
                    resultJson.text,
                    resultJson.keyboard,
                    instanceTelegram,
                    userListWithChatID,
                    true,
                );
            }
        }
    } catch (e: any) {
        errorLogger('Error deleteMessageAndSendNewShoppingList:', e, adapter);
    }
}
