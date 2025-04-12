import type { UserListWithChatId } from '../types/types';
import { errorLogger } from '../app/logging';

export const getChatID = (userListWithChatID: UserListWithChatId[], user: string): string | undefined => {
    for (const element of userListWithChatID) {
        if (element.name === user) {
            return element.chatID;
        }
    }
    return;
};

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const deepCopy = <T>(obj: T): T | undefined => {
    try {
        return !isDefined(obj) ? undefined : JSON.parse(JSON.stringify(obj));
    } catch (err) {
        errorLogger(`Error deepCopy: `, err);
    }
};
