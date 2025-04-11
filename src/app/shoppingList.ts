import { deleteMessageIds } from './messageIds.js';
import { createKeyboardFromJson } from './jsonTable.js';
import { sendToTelegram, sendToTelegramSubmenu } from './telegram.js';
import { _subscribeAndUnSubscribeForeignStatesAsync } from './subscribeStates.js';
import { errorLogger } from './logging.js';
import { _this } from '../main.js';
import type { UserListWithChatId } from '../types/types.js';
import { jsonString } from '../lib/string';

interface ObjectData {
    [key: string]: {
        idList: string;
    };
}
const objData: ObjectData = {};

let isSubscribed = false;

async function shoppingListSubscribeStateAndDeleteItem(
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
            res = await _this.getForeignObjectAsync(`alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}`);

            if (res) {
                objData[user] = { idList: idList };
                _this.log.debug(`Alexa-shoppinglist: ${idList}`);
                if (!isSubscribed) {
                    await _subscribeAndUnSubscribeForeignStatesAsync({ id: `alexa-shoppinglist.${idList}` });
                    isSubscribed = true;
                }
                await _this.setForeignStateAsync(
                    `alexa2.${instance}.Lists.SHOPPING_LIST.items.${idItem}.#delete`,
                    true,
                    false,
                );
                return;
            }
            await sendToTelegram({
                user: user,
                textToSend: 'Cannot delete the Item',
                keyboard: undefined,
                instance: instanceTelegram,
                resize_keyboard: resize_keyboard,
                one_time_keyboard: one_time_keyboard,
                userListWithChatID: userListWithChatID,
                parse_mode: 'true',
            });
            _this.log.debug('Cannot delete the Item');
            return;
        }
    } catch (e: any) {
        errorLogger('Error shoppingList:', e);
    }
}

async function deleteMessageAndSendNewShoppingList(
    instanceTelegram: string,
    userListWithChatID: UserListWithChatId[],
    userToSend: string,
): Promise<void> {
    try {
        const user = userToSend;
        const idList = objData[user].idList;
        await _subscribeAndUnSubscribeForeignStatesAsync({ id: `alexa-shoppinglist.${idList}` });
        await deleteMessageIds(user, userListWithChatID, instanceTelegram, 'last');

        const result = await _this.getForeignStateAsync(`alexa-shoppinglist.${idList}`);
        if (result && result.val) {
            _this.log.debug(`Result from Shoppinglist: ${jsonString(result)}`);
            const newId = `alexa-shoppinglist.${idList}`;
            const resultJson = createKeyboardFromJson(result.val as string, null, newId, user);
            if (resultJson && resultJson.text && resultJson.keyboard) {
                sendToTelegramSubmenu(
                    user,
                    resultJson.text,
                    resultJson.keyboard,
                    instanceTelegram,
                    userListWithChatID,
                    'true',
                );
            }
        }
    } catch (e: any) {
        errorLogger('Error deleteMessageAndSendNewShoppingList:', e);
    }
}

export { shoppingListSubscribeStateAndDeleteItem, deleteMessageAndSendNewShoppingList };
