import { sendToTelegram } from './telegram';
import { checkTypeOfId } from '../lib/utilities';
import { setDynamicValue } from './dynamicValue';
import { decomposeText } from './global';
import { _this } from '../main';
import { debug, errorLogger } from './logging';
import type { Part, SetStateIds, UserListWithChatId } from '../types/types';

const modifiedValue = (valueFromSubmenu: string, value: string): string => {
    if (value && value.includes('{value}')) {
        return value.replace('{value}', valueFromSubmenu);
    }
    return valueFromSubmenu;
};
const isDynamicValueToSet = async (value: string | number | boolean): Promise<string | number | boolean> => {
    if (typeof value === 'string' && value.includes('{id:')) {
        const result = decomposeText(value, '{id:', '}');
        const id = result.substring.replace('{id:', '').replace('}', '');
        const newValue = await _this.getForeignStateAsync(id);
        if (newValue && newValue.val && typeof newValue.val === 'string') {
            return value.replace(result.substring, newValue.val);
        }
    }
    return value;
};
const setValue = async (
    id: string,
    value: string,
    SubmenuValuePriority: boolean,
    valueFromSubmenu: string | number,
    ack: boolean,
): Promise<void> => {
    try {
        let valueToSet;
        SubmenuValuePriority
            ? (valueToSet = modifiedValue(valueFromSubmenu as string, value))
            : (valueToSet = await isDynamicValueToSet(value));
        await checkTypeOfId(id, valueToSet).then((val: ioBroker.StateValue | ioBroker.SettableState | undefined) => {
            valueToSet = val;
            debug([{ text: 'Value to Set:', val: valueToSet }]);
            if (valueToSet !== undefined && valueToSet !== null) {
                _this.setForeignState(id, valueToSet, ack);
            }
        });
    } catch (error: any) {
        error([
            { text: 'Error setValue', val: error.message },
            { text: 'Stack', val: error.stack },
        ]);
    }
};

export const setState = async (
    part: Part,
    userToSend: string,
    valueFromSubmenu: string | number,
    SubmenuValuePriority: boolean,
    telegramInstance: string,
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
): Promise<SetStateIds[] | undefined> => {
    try {
        const setStateIds: SetStateIds[] = [];
        if (!part.switch) {
            return;
        }
        for (const element of part.switch) {
            let ack = false;
            let returnText = element.returnText;

            ack = element?.ack ? element.ack === 'true' : false;

            if (returnText.includes('{setDynamicValue')) {
                const { confirmText, id } = await setDynamicValue(
                    returnText,
                    ack,
                    element.id,
                    userToSend,
                    telegramInstance,
                    one_time_keyboard,
                    resize_keyboard,
                    userListWithChatID,
                    element.parse_mode,
                    element.confirm,
                );

                if (element.confirm) {
                    setStateIds.push({
                        id: id || element.id,
                        confirm: element.confirm,
                        returnText: confirmText,
                        userToSend: userToSend,
                    });
                    return setStateIds;
                }
            }

            if (!returnText.includes("{'id':'")) {
                setStateIds.push({
                    id: element.id,
                    confirm: element.confirm,
                    returnText: returnText,
                    userToSend: userToSend,
                    parse_mode: element.parse_mode,
                });
            } else {
                returnText = returnText.replace(/'/g, '"');
                const textToSend = returnText.slice(0, returnText.indexOf('{')).trim();
                const returnObj = JSON.parse(returnText.slice(returnText.indexOf('{'), returnText.indexOf('}') + 1));

                returnObj.text = returnObj.text + returnText.slice(returnText.indexOf('}') + 1);
                if (textToSend && textToSend !== '') {
                    await sendToTelegram({
                        user: userToSend,
                        textToSend: textToSend,
                        keyboard: undefined,
                        instance: telegramInstance,
                        resize_keyboard: one_time_keyboard,
                        one_time_keyboard: resize_keyboard,
                        userListWithChatID: userListWithChatID,
                        parse_mode: element.parse_mode,
                    });
                }

                setStateIds.push({
                    id: returnObj.id,
                    confirm: true,
                    returnText: returnObj.text,
                    userToSend: userToSend,
                });
            }
            if (element.toggle) {
                _this
                    .getForeignStateAsync(element.id)
                    .then(val => {
                        if (val) {
                            _this.setForeignStateAsync(element.id, !val.val, ack).catch((e: any) => {
                                errorLogger('Error setForeignStateAsync:', e);
                            });
                        }
                    })
                    .catch((e: any) => {
                        errorLogger('Error getForeignStateAsync:', e);
                    });
            } else {
                await setValue(element.id, element.value, SubmenuValuePriority, valueFromSubmenu, ack);
            }
        }
        return setStateIds;
    } catch (error: any) {
        errorLogger('Error Switch', error);
    }
};
