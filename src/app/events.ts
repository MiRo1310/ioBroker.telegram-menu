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

/**
 * Convert string to boolean
 *
 * @param value String value to convert
 * @returns boolean or null
 *
 * Testet in test/test/events.test.ts
 */
export const toBoolean = (value: string): boolean | null => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return null;
};

const isNumber = (val: ioBroker.StateValue): val is number => typeof val == 'number';

/**
 * Check condition of event
 *
 * @param adapter Adapter instance
 * @param stateValue State value
 * @param event Event action
 *
 * Testet in test/test/events.test.ts
 */
export function checkCondition(adapter: Adapter, stateValue: ioBroker.StateValue, event: EventAction): boolean {
    const conditionVal = event.condition[0];
    const bool = toBoolean(conditionVal);
    let comparator = event.conditionFilter?.[0] ?? '=';

    if (!isNumber(stateValue) && ['<', '>', '>=', '<='].includes(comparator)) {
        adapter.log.error(
            `Event conditions can not be checked, you cannot compare string, or boolean with the comparator ${comparator}. Condition will check with '=' !`,
        );
        comparator = '=';
    }

    if (!isDefined(stateValue)) {
        adapter.log.error(`State value is undefined, event condition can not be checked!`);
        return false;
    }

    const floatedVal = isNumber(stateValue) ? parseFloat(conditionVal) : 0;
    switch (comparator) {
        case '=':
            return isDefined(bool)
                ? stateValue === bool
                : (isNumber(stateValue) && stateValue == floatedVal) || stateValue == conditionVal;
        case '!=':
            return isDefined(bool)
                ? stateValue != bool
                : (isNumber(stateValue) && stateValue != floatedVal) || stateValue != conditionVal;
        case '<':
            return isNumber(stateValue) && stateValue < floatedVal;
        case '>':
            return isNumber(stateValue) && stateValue > floatedVal;
        case '<=':
            return isNumber(stateValue) && stateValue <= floatedVal;
        case '>=':
            return isNumber(stateValue) && stateValue >= floatedVal;
        default:
            return false;
    }
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
                if (checkCondition(adapter, state.val, event)) {
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
