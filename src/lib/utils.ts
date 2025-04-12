import type { UserListWithChatId } from '../types/types';

export const getChatID = (userListWithChatID: UserListWithChatId[], user: string): string | undefined => {
    for (const element of userListWithChatID) {
        if (element.name === user) {
            return element.chatID;
        }
    }
    return;
};

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;
