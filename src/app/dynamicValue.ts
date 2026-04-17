import type { IDynamicValue, SetDynamicValueObj, TelegramParams } from '@backend/types/types';
import { decomposeText } from '@backend/lib/string';
import { sendToTelegram } from '@backend/app/telegram';

class DynamicValueHandler {
    private dynamicValueObj: SetDynamicValueObj = {};

    public getValue = (userToSend: string): IDynamicValue | null => this.dynamicValueObj[userToSend] ?? null;

    public removeUser = (userToSend: string): boolean => {
        if (this.dynamicValueObj[userToSend]) {
            delete this.dynamicValueObj[userToSend];
            return true;
        }
        return false;
    };

    public setValue = async (
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
        array = this.isBraceDeleteEntry(array);
        const question = array[0];
        const confirmText = array[2];
        if (question) {
            await sendToTelegram({
                instance,
                userToSend,
                textToSend: question,
                telegramParams,
                parse_mode,
            });
        }
        this.dynamicValueObj[userToSend] = {
            idToSet: id,
            ack,
            returnText: confirmText,
            userToSend,
            parse_mode,
            confirm,
            telegramParams,
            valueType: array[1],
            watchForId: array[3],
        };

        if (confirmText && confirmText != '') {
            return { confirmText, id: array[3] !== '' ? array[3] : undefined };
        }
        return { confirmText: '', id: undefined };
    };

    private isBraceDeleteEntry(array: string[]): string[] {
        return array[4] === '}' ? array.slice(0, 4) : array;
    }
}

export const dynamicValue = new DynamicValueHandler();
