import type { Actions } from '../types/types';
import type { MenusWithUsers, UserType } from '@/types/app';

interface EventParams {
    isEvent: boolean;
    eventInstanceList: UserType[];
}

/**
 * Get all instances from the provided menus
 *
 * @param menuToGo This is a list but its contains only one menu
 * @param menusWithUsers All users in groups
 * @returns List of instances
 *
 * Testet in test/test/events.test.ts
 */
export const getInstances = (menuToGo: string[], menusWithUsers: MenusWithUsers): UserType[] => {
    return menuToGo.flatMap(m => menusWithUsers[m] ?? []);
};

/**
 * Get all instances from events by ID
 *
 * @param action All actions
 * @param id State changed ID
 * @param menusWithUsers All users in groups
 * @returns List of instances and isEvent true/false
 *
 * Testet in test/test/events.test.ts
 */
export const getInstancesFromEventsById = (
    action: Record<string, Actions | undefined> | undefined,
    id: string,
    menusWithUsers: MenusWithUsers,
): EventParams => {
    const event = action && Object.keys(action).filter(a => action[a]?.events?.some(e => e.ID?.includes(id)));

    return { isEvent: !!(event && event?.length), eventInstanceList: getInstances(event ?? [], menusWithUsers) };
};
