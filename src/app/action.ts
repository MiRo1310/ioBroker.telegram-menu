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
    GenerateActionsArrayOfEntries,
    GenerateActionsNewObject,
    MenuData,
    NewObjectStructure,
    Part,
    Switch,
    UserInGroup,
    UserListWithChatId,
    UserObjectActions,
} from '../types/types';
import { decomposeText, getNewline, jsonString } from '../lib/string';
import { isDefined, isTruthy } from '../lib/utils';
import { evaluate } from '../lib/math';
import { config } from '../config/config';

const bindingFunc = async (
    text: string,
    userToSend: string,
    telegramInstance: string,
    one_time_keyboard: boolean,
    resize_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
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
                const array = item.split(':');
                const key = array[0];
                const id = array[1];

                const result = await adapter.getForeignStateAsync(id);
                if (result) {
                    bindingObject.values[key] = result.val?.toString() ?? '';
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
            telegramInstance,
            resize_keyboard,
            one_time_keyboard,
            userListWithChatID,
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
    telegramInstance,
    one_time_keyboard,
    resize_keyboard,
    userListWithChatID,
}: {
    selector: string;
    text: string;
    userToSend: string;
    newline: BooleanString;
    telegramInstance: string;
    one_time_keyboard: boolean;
    resize_keyboard: boolean;
    userListWithChatID: UserListWithChatId[];
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
                    telegramInstance: telegramInstance,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                });
            })
            .catch(e => {
                errorLogger('Error Promise:', e, adapter);
            });
    } catch (error: any) {
        errorLogger('Error idBySelector: ', error, adapter);
    }
};

function generateActions(
    action: Actions,
    userObject: NewObjectStructure,
): { obj: NewObjectStructure; ids: string[] } | undefined {
    try {
        const arrayOfEntries: GenerateActionsArrayOfEntries[] = [
            {
                objName: 'echarts',
                name: 'echarts',
                loop: 'preset',
                elements: [
                    { name: 'preset' },
                    { name: 'echartInstance' },
                    { name: 'background' },
                    { name: 'theme' },
                    { name: 'filename' },
                ],
            },
            {
                objName: 'loc',
                name: 'location',
                loop: 'latitude',
                elements: [{ name: 'latitude' }, { name: 'longitude' }, { name: 'parse_mode', key: 0 }],
            },
            {
                objName: 'pic',
                name: 'sendPic',
                loop: 'IDs',
                elements: [
                    { name: 'id', value: 'IDs' },
                    { name: 'fileName' },
                    { name: 'delay', value: 'picSendDelay' },
                ],
            },
            {
                objName: 'get',
                name: 'getData',
                loop: 'IDs',
                elements: [
                    { name: 'id', value: 'IDs' },
                    { name: 'text', type: 'text' },
                    { name: 'newline', value: 'newline_checkbox' },
                    { name: 'parse_mode', key: 0 },
                ],
            },
            {
                objName: 'httpRequest',
                name: 'httpRequest',
                loop: 'url',
                elements: [{ name: 'url' }, { name: 'user' }, { name: 'password' }, { name: 'filename' }],
            },
        ];

        const listOfSetStateIds: string[] = [];
        action.set.forEach(function (
            { trigger, switch_checkbox, returnText, parse_mode, values, confirm, ack, IDs },
            key,
        ) {
            const triggerName = trigger[0];
            if (key == 0) {
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
                    ack: isTruthy(ack[index]),
                    parse_mode: isTruthy(parse_mode[0]),
                };
                if (Array.isArray(userObject[triggerName]?.switch)) {
                    userObject[triggerName].switch.push(newObj);
                }
            });
        });

        arrayOfEntries.forEach(item => {
            if (action[item.objName as keyof Actions]) {
                action[item.objName as keyof Actions].forEach(function (element, index: number) {
                    const trigger = element.trigger[0];
                    userObject[trigger] = { [item.name]: [] };
                    if (index == 0) {
                        userObject[trigger] = { [item.name as keyof UserObjectActions]: [] };
                    }

                    (element[item.loop as keyof typeof element] as string[]).forEach(function (
                        id: string,
                        key: number,
                    ) {
                        const newObj = {} as GenerateActionsNewObject;
                        item.elements.forEach(({ name, value, key: elKey }) => {
                            const elName = (value ? value : name) as keyof typeof element;
                            const newKey = elKey ? elKey : key;

                            const val = !element[elName] ? false : element[elName][newKey] || 'false';

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
            }
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
        if (value == 'true') {
            return true;
        }
        adapter.log.error(`Error: Value is not a boolean: ${value}`);
        return false;
    }
    return value;
};

const checkEvent = async (
    dataObject: DataObject,
    id: string,
    state: ioBroker.State,
    menuData: MenuData,
    userListWithChatID: UserListWithChatId[],
    instanceTelegram: string,
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
    usersInGroup: UserInGroup,
): Promise<boolean> => {
    const menuArray: string[] = [];
    let ok = false;
    let calledNav = '';
    Object.keys(dataObject.action).forEach(menu => {
        if (dataObject.action[menu]?.events) {
            dataObject.action[menu].events.forEach(event => {
                if (event.ID[0] == id && event.ack[0] == state.ack.toString()) {
                    if ((state.val == true || state.val == 'true') && event.condition == 'true') {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    } else if ((state.val == false || state.val == 'false') && event.condition[0] == 'false') {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    } else if (typeof state.val == 'number' && state.val == parseInt(event.condition[0])) {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    } else if (state.val == event.condition[0]) {
                        ok = true;
                        menuArray.push(menu);
                        calledNav = event.menu[0];
                    }
                }
            });
        }
    });
    if (ok) {
        if (menuArray.length >= 1) {
            for (const menu of menuArray) {
                if (usersInGroup[menu] && menuData[menu][calledNav as keyof DataObject]) {
                    for (const user of usersInGroup[menu]) {
                        const part = menuData[menu][calledNav as keyof DataObject];
                        const menus = Object.keys(menuData);
                        if (part.nav) {
                            backMenuFunc({ startSide: calledNav, navigation: part.nav, userToSend: user });
                        }
                        if (part?.nav && part?.nav[0][0].includes('menu:')) {
                            await callSubMenu(
                                JSON.stringify(part?.nav[0]),
                                menuData,
                                user,
                                instanceTelegram,
                                resize_keyboard,
                                one_time_keyboard,
                                userListWithChatID,
                                part,
                                menuData,
                                menus,
                                null,
                                part.nav,
                            );
                        } else {
                            await sendNav(
                                part,
                                user,
                                instanceTelegram,
                                userListWithChatID,
                                resize_keyboard,
                                one_time_keyboard,
                            );
                        }
                    }
                }
            }
        }
    }

    return ok;
};

const getUserToSendFromUserListWithChatID = (
    userListWithChatID: UserListWithChatId[],
    chatID: string,
): string | null => {
    let userToSend: string | null = null;

    for (const element of userListWithChatID) {
        if (element.chatID == chatID) {
            userToSend = element.name;
            break;
        }
    }

    return userToSend;
};

export { idBySelector, generateActions, bindingFunc, adjustValueType, checkEvent, getUserToSendFromUserListWithChatID };
