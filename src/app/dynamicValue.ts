import type { IDynamicValue, SetDynamicValueObj } from '@backend/types/types';
import { decomposeText } from '@backend/lib/string';
import { sendToTelegram } from '@backend/app/telegram';
import type { AppContext } from '@backend/app/appContext';

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
        appContext: AppContext,
        instance: string,
        returnText: string,
        ack: boolean,
        id: string,
        userToSend: string,
        parse_mode: boolean,
        confirm: boolean,
    ): Promise<{ confirmText: string; id: string | undefined }> => {
        const { substringExcludeSearch } = decomposeText(returnText, '{setDynamicValue:', '}');
        const [question, valueType, confirmText, watchForId] = substringExcludeSearch.split(':');

        if (question) {
            await sendToTelegram({
                instance,
                userToSend,
                textToSend: question,
                appContext,
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
            appContext,
            valueType,
            watchForId,
        };

        if (confirmText && confirmText != '') {
            return { confirmText, id: watchForId !== '' ? watchForId : undefined };
        }
        return { confirmText: '', id: undefined };
    };
}

export const dynamicValue = new DynamicValueHandler();
