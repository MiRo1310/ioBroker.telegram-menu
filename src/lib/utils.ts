import type { Adapter } from '../types/types';
import { errorLogger } from '../app/logging';
import type { UserListWithChatID } from '@/types/app';
import type { AppContext } from '@backend/app/appContext';

export const getChatID = (userListWithChatID: UserListWithChatID[], user: string): string | undefined => {
    for (const element of userListWithChatID) {
        if (element.name === user) {
            return element.chatID;
        }
    }
    return;
};

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const deepCopy = <T>(obj: T, adapter: Adapter): T | undefined => {
    try {
        return !isDefined(obj) ? undefined : JSON.parse(JSON.stringify(obj));
    } catch (err) {
        errorLogger(`Error deepCopy: `, err, adapter);
    }
};

export function validateDirectory(appContext: AppContext): boolean {
    if (!isDefined(appContext.directoryPicture) || appContext.directoryPicture === '') {
        appContext.adapter.log.error(
            'No directory to save the picture. Please add a directory in the settings with full read and write permissions.',
        );
        return false;
    }
    return true;
}

export const isTruthy = (value?: ioBroker.StateValue): boolean =>
    isDefined(value) && ['1', 1, true, 'true'].includes(value);

export const isFalsy = (value?: ioBroker.StateValue): boolean =>
    ['0', 0, false, 'false', undefined, null].includes(value);
