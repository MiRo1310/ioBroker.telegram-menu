import type { Actions, Adapter, DataObject, MenuData, TelegramParams } from '../types/types';
import type { EventAction, MenusWithUsers, UserType } from '@/types/app';
import { backMenuFunc } from '@b/app/backMenu';
import { callSubMenu } from '@b/app/subMenu';
import { sendNav } from '@b/app/sendNav';
import { isDefined } from '@b/lib/utils';

interface EventParams {
    isEvent: boolean;
    eventUserList: UserType[];
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

    return { isEvent: !!(event && event?.length), eventUserList: getInstances(event ?? [], menusWithUsers) };
};

const toBoolean = (value: string): boolean | null => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return null;
};

function checkCondition(bool: null | boolean, state: ioBroker.State, condition: string): boolean {
    return isDefined(bool)
        ? state.val === bool
        : (typeof state.val == 'number' && (state.val == parseInt(condition) || state.val == parseFloat(condition))) ||
              state.val == condition;
}

function checkIdAndAck(event: EventAction, id: string, state: ioBroker.State): boolean {
    return event.ID[0] == id && event.ack[0] == state.ack.toString();
}

export const handleEvent = async (
    adapter: Adapter,
    user: UserType,
    dataObject: DataObject,
    id: string,
    state: ioBroker.State,
    menuData: MenuData,
    telegramParams: TelegramParams,
): Promise<boolean> => {
    const menuArray: string[] = [];
    let calledNav = '';

    const action = dataObject.action;
    if (!action) {
        return false;
    }
    for (const menu of Object.keys(action)) {
        const events = action[menu]?.events;
        if (!events) {
            continue;
        }
        events.forEach(event => {
            if (checkIdAndAck(event, id, state)) {
                const condition = event.condition[0];
                const bool = toBoolean(condition);

                if (checkCondition(bool, state, condition)) {
                    menuArray.push(menu);
                    calledNav = event.menu[0];
                }
            }
        });
    }
    if (!menuArray.length) {
        return false;
    }

    for (const menu of menuArray) {
        const part = menuData[menu][calledNav as keyof DataObject];

        const menus = Object.keys(menuData);

        if (part.nav) {
            backMenuFunc({ activePage: calledNav, navigation: part.nav, userToSend: user.name });
        }

        if (part?.nav?.[0][0].includes('menu:')) {
            await callSubMenu({
                adapter,
                instance: user.instance,
                jsonStringNav: JSON.stringify(part.nav),
                userToSend: user.name,
                telegramParams,
                part,
                allMenusWithData: menuData,
                menus,
            });
            return true;
        }

        await sendNav(adapter, user.instance, part, user.name, telegramParams);
    }
    return true;
};
