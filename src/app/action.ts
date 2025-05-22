import { sendToTelegram } from './telegram';
import { callSubMenu } from './subMenu';
import { sendNav } from './sendNav';
import { backMenuFunc } from './backMenu';
import { errorLogger } from './logging';
import { adapter } from '../main';
import type {
    Actions,
    BindingObject,
    BooleanString,
    DataObject,
    GenerateActionsNewObject,
    MenuData,
    NewObjectStructure,
    Part,
    Switch,
    TelegramParams,
    UserListWithChatId,
    UserObjectActions,
    UsersInGroup,
} from '../types/types';
import { decomposeText, getNewline, jsonString } from '../lib/string';
import { isDefined, isFalsy, isTruthy } from '../lib/utils';
import { evaluate } from '../lib/math';
import { arrayOfEntries, config } from '../config/config';
import { getBindingValues } from '../lib/splitValues';

const bindingFunc = async (
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
            userToSend,
            textToSend,
            telegramParams,
            parse_mode,
        });
    } catch (e: any) {
        errorLogger('Error Binding function: ', e, adapter);
    }
};

const idBySelector = async ({
    selector,
    text,
    userToSend,
    newline,
    telegramParams,
}: {
    selector: string;
    text: string;
    userToSend: string;
    newline: BooleanString;
    telegramParams: TelegramParams;
}): Promise<void> => {
    let text2Send = '';
    try {
        const functions = selector.replace(config.functionSelektor, '');
        let enums: string[] | undefined = [];
        const result = await adapter.getEnumsAsync();

        if (!result?.['enum.functions'][`enum.functions.${functions}`]) {
            return;
        }
        enums = result['enum.functions'][`enum.functions.${functions}`].common.members;
        if (!enums) {
            return;
        }

        const promises = enums.map(async (id: string) => {
            const value = await adapter.getForeignStateAsync(id);
            if (isDefined(value?.val)) {
                let newText = text;
                let res;

                if (text.includes('{common.name}')) {
                    res = await adapter.getForeignObjectAsync(id);
                    adapter.log.debug(`Name ${jsonString(res?.common.name)}`);

                    if (res && typeof res.common.name === 'string') {
                        newText = newText.replace('{common.name}', res.common.name);
                    }
                }
                if (text.includes('&amp;&amp;')) {
                    text2Send += newText.replace('&amp;&amp;', String(value.val));
                } else if (text.includes('&&')) {
                    text2Send += newText.replace('&&', String(value.val));
                } else {
                    text2Send += newText;
                    text2Send += ` ${value.val}`;
                }
            }

            text2Send += getNewline(newline);

            adapter.log.debug(`text2send ${JSON.stringify(text2Send)}`);
        });
        Promise.all(promises)
            .then(async () => {
                await sendToTelegram({
                    userToSend,
                    textToSend: text2Send,
                    telegramParams,
                });
            })
            .catch(e => {
                errorLogger('Error Promise:', e, adapter);
            });
    } catch (error: any) {
        errorLogger('Error idBySelector: ', error, adapter);
    }
};

function generateActions({
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
                    ack: isTruthy(ack?.[index] ?? false),
                    parse_mode: isTruthy(parse_mode[0]),
                };
                if (Array.isArray(userObject[triggerName]?.switch)) {
                    userObject[triggerName].switch.push(newObj);
                }
            });
        });

        arrayOfEntries.forEach(item => {
            const actions = action?.[item.objName as keyof Actions];

            actions?.forEach(function (element, index) {
                const trigger = element.trigger[0];
                userObject[trigger] = { [item.name]: [] };
                if (index == 0) {
                    userObject[trigger] = { [item.name as keyof UserObjectActions]: [] };
                }

                (element[item.loop as keyof typeof element] as string[]).forEach(function (id, index) {
                    const newObj = {} as GenerateActionsNewObject;
                    item.elements.forEach(({ name, value, index: elIndex }) => {
                        const elName = (value ? value : name) as keyof typeof element;
                        const newIndex = elIndex ? elIndex : index;

                        const val = !element[elName] ? false : element[elName][newIndex] || 'false';

                        if (name === 'parse_mode') {
                            newObj.parse_mode = isTruthy(val);
                        }

                        if (typeof val === 'string') {
                            newObj[name as keyof GenerateActionsNewObject] = val.replace(/&amp;/g, '&') as any;
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

const adjustValueType = (value: keyof NewObjectStructure, valueType: string): boolean | string | number => {
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

export const checkEvent = async (
    dataObject: DataObject,
    id: string,
    state: ioBroker.State,
    menuData: MenuData,
    telegramParams: TelegramParams,
    usersInGroup: UsersInGroup,
): Promise<boolean> => {
    const menuArray: string[] = [];
    let ok = false;
    let calledNav = '';

    if (!dataObject.action) {
        return false;
    }

    Object.keys(dataObject.action).forEach(menu => {
        if (dataObject.action?.[menu]?.events) {
            dataObject.action[menu].events.forEach(event => {
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
        if (usersInGroup[menu] && part) {
            for (const user of usersInGroup[menu]) {
                const menus = Object.keys(menuData);

                if (part.nav) {
                    backMenuFunc({ activePage: calledNav, navigation: part.nav, userToSend: user });
                }

                if (part?.nav?.[0][0].includes('menu:')) {
                    await callSubMenu({
                        jsonStringNav: part.nav[0][0],
                        userToSend: user,
                        telegramParams: telegramParams,
                        part: part,
                        allMenusWithData: menuData,
                        menus: menus,
                    });
                    return true;
                }
                await sendNav(part, user, telegramParams);
            }
        }
    }
    return true;
};

export const getUserToSendFromUserListWithChatID = (
    userListWithChatID: UserListWithChatId[],
    chatID: string,
): string | undefined => {
    for (const element of userListWithChatID) {
        if (element.chatID == chatID) {
            return element.name;
        }
    }
};

export { idBySelector, generateActions, bindingFunc, adjustValueType };
