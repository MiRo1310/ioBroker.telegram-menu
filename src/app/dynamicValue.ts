import { decomposeText } from '../lib/string';
import { sendToTelegram } from './telegram';
import type { SetDynamicValue, SetDynamicValueObj, TelegramParams } from '../types/types';

const dynamicValueObj: SetDynamicValueObj = {};
export const setDynamicValue = async (
    returnText: string,
    ack: boolean,
    id: string,
    userToSend: string,
    telegramParams: TelegramParams,
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
        valueType: array[2],
        navToGoTo: array[4],
    };

    if (array[3] && array[3] != '') {
        return { confirmText: array[3], id: array[4] };
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
