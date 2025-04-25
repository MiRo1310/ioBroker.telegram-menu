import { sendToTelegram } from './telegram';
import { checkTypeOfId } from '../lib/utilities';
import { setDynamicValue } from './dynamicValue';
import { adapter } from '../main';
import { errorLogger } from './logging';
import type { Part, SetStateIds, UserListWithChatId } from '../types/types';
import { jsonString, decomposeText, parseJSON } from '../lib/string';
import { isTruthy } from '../lib/utils';
import { config } from '../config/config';

const modifiedValue = (valueFromSubmenu: string, value: string): string => {
    return value.includes(config.modifiedValue)
        ? value.replace(config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};

const isDynamicValueToSet = async (value: string | number | boolean): Promise<string | number | boolean> => {
    if (typeof value === 'string' && value.includes(config.dynamicValue.start)) {
        const { substring, substringExcludeSearch: id } = decomposeText(
            value,
            config.dynamicValue.start,
            config.dynamicValue.end,
        );

        const newValue = await adapter.getForeignStateAsync(id);

        if (typeof newValue?.val === 'string') {
            return value.replace(substring, newValue.val);
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
            adapter.log.debug(`Value to Set: ${jsonString(valueToSet)}`);

            if (valueToSet !== undefined && valueToSet !== null) {
                adapter.setForeignState(id, valueToSet, ack);
            }
        });
    } catch (error: any) {
        errorLogger('Error setValue', error, adapter);
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
        for (const { returnText: text, id: ID, parse_mode, confirm, ack, toggle, value } of part.switch) {
            let returnText = text;
            if (returnText.includes(config.setDynamicValue)) {
                const { confirmText, id } = await setDynamicValue(
                    returnText,
                    isTruthy(ack),
                    ID,
                    userToSend,
                    telegramInstance,
                    one_time_keyboard,
                    resize_keyboard,
                    userListWithChatID,
                    parse_mode,
                    confirm,
                );

                if (confirm) {
                    setStateIds.push({
                        id: id ?? ID,
                        confirm,
                        returnText: confirmText,
                        userToSend: userToSend,
                    });
                    return setStateIds;
                }
            }

            if (!returnText.includes("{'id':'")) {
                setStateIds.push({
                    id: ID,
                    confirm,
                    returnText,
                    userToSend,
                    parse_mode,
                });
            } else {
                returnText = returnText.replace(/'/g, '"');
                const textToSend = returnText.slice(0, returnText.indexOf('{')).trim();
                const { json, isValidJson } = parseJSON<{ text: string; id: string }>(
                    returnText.slice(returnText.indexOf('{'), returnText.indexOf('}') + 1),
                );
                if (!isValidJson) {
                    return;
                }

                json.text = json.text + returnText.slice(returnText.indexOf('}') + 1);
                if (textToSend && textToSend !== '') {
                    await sendToTelegram({
                        userToSend,
                        textToSend,
                        telegramInstance,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                        parse_mode,
                    });
                }

                setStateIds.push({
                    id: json.id,
                    confirm: true,
                    returnText: json.text,
                    userToSend: userToSend,
                });
            }
            if (toggle) {
                adapter
                    .getForeignStateAsync(ID)
                    .then(val => {
                        if (val) {
                            adapter.setForeignStateAsync(ID, !val.val, ack).catch((e: any) => {
                                errorLogger('Error setForeignStateAsync:', e, adapter);
                            });
                        }
                    })
                    .catch((e: any) => {
                        errorLogger('Error getForeignStateAsync:', e, adapter);
                    });
            } else {
                await setValue(ID, value, SubmenuValuePriority, valueFromSubmenu, isTruthy(ack));
            }
        }
        return setStateIds;
    } catch (error: any) {
        errorLogger('Error Switch', error, adapter);
    }
};
