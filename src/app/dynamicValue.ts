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
    oneTimeKeyboard: boolean,
    resizeKeyboard: boolean,
    userListWithChatID: UserListWithChatId[],
    parseMode: boolean,
    confirm: string,
): Promise<{ confirmText: string; id: string | undefined }> => {
    const { substring } = decomposeText(returnText, '{setDynamicValue:', '}');
    let array = substring.split(':');
    array = isBraceDeleteEntry(array);
    const text = array[1];
    if (text) {
        await sendToTelegram({
            user: userToSend,
            textToSend: text,
            instance: telegramInstance,
            resizeKeyboard,
            oneTimeKeyboard,
            userListWithChatID,
            parseMode,
        });
    }
    setDynamicValueObj[userToSend] = {
        id,
        ack,
        returnText: text,
        userToSend,
        parseMode,
        confirm,
        telegramInstance,
        oneTimeKeyboard,
        resizeKeyboard,
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
