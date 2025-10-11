import type { Actions } from '../types/types';
import type { UsersInGroup, UserType } from '@/types/app';

interface EventParams {
    isEvent: boolean;
    eventInstanceList: UserType[];
}

const getInstances = (menus: string[], menusWithUsers: UsersInGroup): UserType[] => {
    return menus.flatMap(m => menusWithUsers[m] ?? []);
};

export const getInstancesFromEventsById = (
    action: Record<string, Actions | undefined> | undefined,
    id: string,
    menusWithUsers: UsersInGroup,
): EventParams => {
    const event =
        action &&
        Object.keys(action).filter(a => action[a]?.events.filter(e => e.ID.filter(eventId => eventId === id)));

    return { isEvent: !!(event && event?.length), eventInstanceList: getInstances(event ?? [], menusWithUsers) };
};
