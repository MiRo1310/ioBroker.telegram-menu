import { sendToTelegram } from './telegram';
import { callSubMenu } from './subMenu';
import { sendNav } from './sendNav';
import { backMenuFunc } from './backMenu';
import { errorLogger } from './logging';

import { adapter } from '../main';

import type {
    Actions,
    BindingObject,
    DataObject,
    GenerateActionsNewObject,
    MenuData,
    NewObjectStructure,
    Part,
    Switch,
    TelegramParams,
    UserObjectActions,
} from '../types/types';
import { decomposeText } from '../lib/string';
import { isFalsy, isTruthy } from '../lib/utils';
import { evaluate } from '../lib/math';
import { arrayOfEntries, config } from '../config/config';
import { getBindingValues } from '../lib/splitValues';
import type { TriggerableActions, UserListWithChatID, MenusWithUsers } from '@/types/app';

export const bindingFunc = async (
    instance: string,
    text: string,
    userToSend: string,
    telegramParams: TelegramParams,
    parse_mode?: boolean,
): Promise<void> => {
    let textToSend;

    try {
        const { substringExcludeSearch } = decomposeText(text, config.binding.start, config.binding.end);
        const arrayOfItems = substringExcludeSearch.split(config.binding.splitChar);
        const bindingObject: BindingObject = {
            values: {},
        };

        for (let item of arrayOfItems) {
            if (!item.includes('?')) {
                const { key, id } = getBindingValues(item);
                if (id) {
                    const result = await adapter.getForeignStateAsync(id);

                    if (result) {
                        bindingObject.values[key] = result.val?.toString() ?? '';
                    }
                }
            } else {
                Object.keys(bindingObject.values).forEach(function (key) {
                    item = item.replace(key, bindingObject.values[key]);
                });

                const { val } = evaluate(item, adapter);
                textToSend = String(val);
            }
        }
        await sendToTelegram({
            instance,
            userToSend,
            textToSend,
            telegramParams,
            parse_mode,
        });
    } catch (e: any) {
        errorLogger('Error Binding function: ', e, adapter);
    }
};

export function generateActions({
    action,
    userObject,
}: {
    action?: Actions;
    userObject: NewObjectStructure;
}): { obj: NewObjectStructure; ids: string[] } | undefined {
    try {
        const listOfSetStateIds: string[] = [];
        action?.set.forEach(function (
            { trigger, switch_checkbox, returnText, parse_mode, values, confirm, ack, IDs },
            index,
        ) {
            const triggerName = trigger[0];
            if (index == 0) {
                userObject[triggerName] = { switch: [] };
            }
            userObject[triggerName] = { switch: [] };

            IDs.forEach(function (id: string, index: number) {
                listOfSetStateIds.push(id);
                const toggle = isTruthy(switch_checkbox[index]);

                const newObj: Switch = {
                    id: IDs[index],
                    value: values[index],
                    toggle: toggle,
                    confirm: confirm[index],
                    returnText: returnText[index],
                    ack: ack?.length ? isTruthy(ack[index]) : false,
                    parse_mode: parse_mode?.length ? isTruthy(parse_mode?.[0]) : false,
                };
                if (Array.isArray(userObject?.[triggerName]?.switch)) {
                    userObject[triggerName].switch?.push(newObj);
                }
            });
        });

        arrayOfEntries.forEach(item => {
            const actions = action?.[item.objName as keyof Actions];

            actions?.forEach(function (element, index) {
                const trigger = (element as TriggerableActions)?.trigger[0];
                userObject[trigger] = { [item.name]: [] };
                if (index == 0) {
                    userObject[trigger] = { [item.name as keyof UserObjectActions]: [] };
                }

                (element[item.loop as keyof typeof element] as []).forEach(function (id, index) {
                    const newObj = {} as GenerateActionsNewObject;
                    item.elements.forEach(({ name, value, index: elIndex }) => {
                        const elName = (value ? value : name) as keyof typeof element;
                        const newIndex = elIndex ? elIndex : index;

                        const val = !element[elName] ? false : (element[elName][newIndex] ?? 'false');

                        if (name === 'parse_mode') {
                            newObj.parse_mode = isTruthy(val);
                        }

                        if (typeof val === 'string') {
                            newObj[name as keyof GenerateActionsNewObject] = String(val).replace(/&amp;/g, '&') as any;
                        }
                    });

                    (userObject?.[trigger]?.[item.name as keyof Part] as GenerateActionsNewObject[]).push(newObj);
                });
            });
        });

        return { obj: userObject, ids: listOfSetStateIds };
    } catch (err: any) {
        errorLogger('Error generateActions:', err, adapter);
    }
}

export const adjustValueType = (value: keyof NewObjectStructure, valueType: string): boolean | string | number => {
    if (valueType == 'number') {
        if (!parseFloat(value)) {
            adapter.log.error(`Error: Value is not a number: ${value}`);
            return false;
        }
        return parseFloat(value);
    }
    if (valueType == 'boolean') {
        return isTruthy(value);
    }
    return value;
};

export const handleEvent = async (
    instance: string,
    dataObject: DataObject,
    id: string,
    state: ioBroker.State,
    menuData: MenuData,
    telegramParams: TelegramParams,
    usersInGroup: MenusWithUsers,
): Promise<boolean> => {
    const menuArray: string[] = [];
    let ok = false;
    let calledNav = '';

    if (!dataObject.action) {
        return false;
    }

    Object.keys(dataObject.action).forEach(menu => {
        if (dataObject.action?.[menu]?.events) {
            dataObject.action[menu]?.events.forEach(event => {
                if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
                    const condition = event.condition[0];
                    if (
                        ((state.val == true || state.val == 'true') && isTruthy(condition)) ||
                        ((state.val == false || state.val == 'false') && isFalsy(condition)) ||
                        (typeof state.val == 'number' && state.val == parseInt(condition)) ||
                        state.val == condition
                    ) {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                }
            });
        }
    });
    if (!ok || !menuArray.length) {
        return false;
    }

    for (const menu of menuArray) {
        const part = menuData[menu][calledNav as keyof DataObject];
        const menuValue = usersInGroup[menu];
        if (menuValue && part) {
            for (const user of menuValue) {
                const menus = Object.keys(menuData);

                if (part.nav) {
                    backMenuFunc({ activePage: calledNav, navigation: part.nav, userToSend: user.name });
                }

                if (part?.nav?.[0][0].includes('menu:')) {
                    await callSubMenu({
                        instance,
                        jsonStringNav: part.nav[0][0],
                        userToSend: user.name,
                        telegramParams: telegramParams,
                        part: part,
                        allMenusWithData: menuData,
                        menus: menus,
                    });
                    return true;
                }
                await sendNav(instance, part, user.name, telegramParams);
            }
        }
    }
    return true;
};

export const getUserToSendFromUserListWithChatID = (
    userListWithChatID: UserListWithChatID[],
    chatID: string,
): UserListWithChatID | undefined => {
    for (const element of userListWithChatID) {
        if (element.chatID == chatID) {
            return element;
        }
    }
};
