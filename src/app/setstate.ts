import { sendToTelegram } from './telegram';
import { transformValueToTypeOfId } from '../lib/utilities';
import { setDynamicValue } from './dynamicValue';
import { adapter } from '../main';
import { errorLogger } from './logging';
import type { Part, TelegramParams } from '../types/types';
import { decomposeText, isNonEmptyString, jsonString, parseJSON } from '../lib/string';
import { isDefined } from '../lib/utils';
import { config } from '../config/config';
import { addSetStateIds } from './setStateIdsToListenTo';
import { exchangeValue } from '../lib/exchangeValue';

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
    valueFromSubmenu: null | string | number | boolean,
    ack: boolean,
): Promise<void> => {
    try {
        // If Value is set in Config the value will set to datapoint otherwise the value from submenu, so submenuValuePriority is obsolete
        const valueToSet =
            isDefined(value) && isNonEmptyString(value)
                ? await isDynamicValueToSet(value)
                : modifiedValue(String(valueFromSubmenu), value);

        await setstateIobroker({ id, value: valueToSet, ack });
    } catch (error: any) {
        errorLogger('Error setValue', error, adapter);
    }
};

export const handleSetState = async (
    part: Part,
    userToSend: string,
    valueFromSubmenu: null | string | number | boolean,
    telegramParams: TelegramParams,
): Promise<void> => {
    try {
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
                    await addSetStateIds({
                        id: id ?? ID,
                        confirm,
                        returnText: confirmText,
                        userToSend,
                    });
                }
                return;
            }

            if (!returnText.includes("{'id':'")) {
                await addSetStateIds({
                    id: ID,
                    confirm,
                    returnText,
                    userToSend,
                    parse_mode,
                });
            } else {
                returnText = returnText.replace(/'/g, '"');
                const { substring } = decomposeText(returnText, '{"id":', '}');
                const { json, isValidJson } = parseJSON<{ text: string; id: string }>(substring);
                if (!isValidJson) {
                    return;
                }
                const text = returnText.replace(substring, json.text);
                let value: null | ioBroker.StateValue = null;

                if (json.id) {
                    const state = await adapter.getForeignStateAsync(json.id);
                    value = state ? state.val : null;
                }

                const { textToSend } = exchangeValue(adapter, text, valueFromSubmenu ?? value);

                await sendToTelegram({
                    userToSend,
                    textToSend,
                    telegramParams,
                    parse_mode,
                });

                await addSetStateIds({
                    id: json.id,
                    confirm: true,
                    returnText: json.text,
                    userToSend: userToSend,
                });
            }
            if (toggle) {
                const state = await adapter.getForeignStateAsync(ID);

                state
                    ? await setstateIobroker({ id: ID, value: !state.val, ack })
                    : await setstateIobroker({ id: ID, value: false, ack });
            } else {
                await setValue(ID, value, valueFromSubmenu, ack);
            }
        }
    } catch (error: any) {
        errorLogger('Error Switch', error, adapter);
    }
};
