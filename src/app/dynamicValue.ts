import type { SetDynamicValue, SetDynamicValueObj, TelegramParams } from '@b/types/types';
import { decomposeText } from '@b/lib/string';
import { sendToTelegram } from '@b/app/telegram';

const dynamicValueObj: SetDynamicValueObj = {};
export const setDynamicValue = async (
    instance: string,
    returnText: string,
    ack: boolean,
    id: string,
    userToSend: string,
    telegramParams: TelegramParams,
    parse_mode: boolean,
    confirm: boolean,
): Promise<{ confirmText: string; id: string | undefined }> => {
    const { substringExcludeSearch } = decomposeText(returnText, '{setDynamicValue:', '}');
    let array = substringExcludeSearch.split(':');
    array = isBraceDeleteEntry(array);
    const text = array[0];
    if (text) {
        await sendToTelegram({
            instance,
            userToSend,
            textToSend: text,
            telegramParams,
            parse_mode,
        });
    }
    dynamicValueObj[userToSend] = {
        id,
        ack,
        returnText: text,
        userToSend,
        parse_mode,
        confirm,
        telegramParams,
        valueType: array[1],
        navToGoTo: array[3],
    };

    if (array[2] && array[2] != '') {
        return { confirmText: array[2], id: array[3] !== '' ? array[3] : undefined };
    }
    return { confirmText: '', id: undefined };
};

export const getDynamicValue = (userToSend: string): SetDynamicValue | null => dynamicValueObj[userToSend] ?? null;

export const removeUserFromDynamicValue = (userToSend: string): boolean => {
    if (dynamicValueObj[userToSend]) {
        delete dynamicValueObj[userToSend];
        return true;
    }
    return false;
};

function isBraceDeleteEntry(array: string[]): string[] {
    if (array[4] === '}') {
        return array.slice(0, 4);
    }
    return array;
}
