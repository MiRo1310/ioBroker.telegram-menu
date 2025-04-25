import { decomposeText } from '../lib/string';
import { sendToTelegram } from './telegram';
import type { SetDynamicValueObj, UserListWithChatId, SetDynamicValue } from '../types/types';

const setDynamicValueObj: SetDynamicValueObj = {};
const setDynamicValue = async (
    returnText: string,
    ack: boolean,
    id: string,
    userToSend: string,
    telegramInstance: string,
    one_time_keyboard: boolean,
    resize_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
    parse_mode: boolean,
    confirm: string,
): Promise<{ confirmText: string; id: string | undefined }> => {
    const { substring } = decomposeText(returnText, '{setDynamicValue:', '}');
    let array = substring.split(':');
    array = isBraceDeleteEntry(array);
    const text = array[1];
    if (text) {
        await sendToTelegram({
            userToSend,
            textToSend: text,
            telegramInstance: telegramInstance,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID,
            parse_mode,
        });
    }
    setDynamicValueObj[userToSend] = {
        id,
        ack,
        returnText: text,
        userToSend,
        parse_mode,
        confirm,
        telegramInstance,
        one_time_keyboard,
        resize_keyboard,
        userListWithChatID,
        valueType: array[2],
    };

    if (array[3] && array[3] != '') {
        return { confirmText: array[3], id: array[4] };
    }
    return { confirmText: '', id: undefined };
};

const getDynamicValue = (userToSend: string): SetDynamicValue | null => {
    if (setDynamicValueObj[userToSend]) {
        return setDynamicValueObj[userToSend];
    }
    return null;
};
const removeUserFromDynamicValue = (userToSend: string): boolean => {
    if (setDynamicValueObj[userToSend]) {
        delete setDynamicValueObj[userToSend];
        return true;
    }
    return false;
};
export { setDynamicValue, getDynamicValue, removeUserFromDynamicValue };

function isBraceDeleteEntry(array: string[]): string[] {
    if (array[4] === '}') {
        return array.slice(0, 4);
    }
    return array;
}
