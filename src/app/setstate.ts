import { sendToTelegram } from './telegram';
import { transformValueToTypeOfId } from '../lib/utilities';
import { setDynamicValue } from './dynamicValue';
import { adapter } from '../main';
import { errorLogger } from './logging';
import type { Part, SetStateIds, TelegramParams } from '../types/types';
import { decomposeText, jsonString, parseJSON } from '../lib/string';
import { isDefined } from '../lib/utils';
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

        return value.replace(substring, String(newValue?.val));
    }
    return value;
};

export const setstateIobroker = async ({
    id,
    value,
    ack,
}: {
    id: string;
    value: string | number | boolean;
    ack: boolean;
}): Promise<void> => {
    try {
        const val = await transformValueToTypeOfId(id, value);

        adapter.log.debug(`Value to Set: ${jsonString(val)}`);
        if (isDefined(val)) {
            await adapter.setForeignStateAsync(id, val, ack);
        }
    } catch (error: any) {
        errorLogger('Error Setstate', error, adapter);
    }
};

const setValue = async (
    id: string,
    value: string,
    SubmenuValuePriority: boolean,
    valueFromSubmenu: string | number,
    ack: boolean,
): Promise<void> => {
    try {
        const valueToSet = SubmenuValuePriority
            ? modifiedValue(String(valueFromSubmenu), value)
            : await isDynamicValueToSet(value);

        await setstateIobroker({ id, value: valueToSet, ack });
    } catch (error: any) {
        errorLogger('Error setValue', error, adapter);
    }
};

export const handleSetState = async (
    part: Part,
    userToSend: string,
    valueFromSubmenu: string | number,
    SubmenuValuePriority: boolean,
    telegramParams: TelegramParams,
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
                    ack,
                    ID,
                    userToSend,
                    telegramParams,
                    parse_mode,
                    confirm,
                );

                if (confirm) {
                    setStateIds.push({
                        id: id ?? ID,
                        confirm,
                        returnText: confirmText,
                        userToSend,
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

                await sendToTelegram({
                    userToSend,
                    textToSend,
                    telegramParams,
                    parse_mode,
                });

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
                    .then(async val => {
                        if (val) {
                            await setstateIobroker({ id: ID, value: !val.val, ack });
                        }
                    })
                    .catch((e: any) => {
                        errorLogger('Error getForeignStateAsync:', e, adapter);
                    });
            } else {
                await setValue(ID, value, SubmenuValuePriority, valueFromSubmenu, ack);
            }
        }
        return setStateIds;
    } catch (error: any) {
        errorLogger('Error Switch', error, adapter);
    }
};
