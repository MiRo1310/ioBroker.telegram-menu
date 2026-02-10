import { config } from '@b/config/config';
import type { Adapter, Part, Telegram, TelegramParams } from '@b/types/types';
import {
    decomposeText,
    isNonEmptyString,
    jsonString,
    parseJSON,
    removeDuplicateSpaces,
    removeQuotes,
    singleQuotesToDoubleQuotes,
} from '@b/lib/string';
import { transformValueToTypeOfId } from '@b/lib/utilities';
import { isDefined } from '@b/lib/utils';
import { errorLogger } from '@b/app/logging';
import { setDynamicValue } from '@b/app/dynamicValue';
import { addSetStateIds } from '@b/app/setStateIdsToListenTo';
import { exchangeValue } from '@b/lib/exchangeValue';
import { sendToTelegram } from '@b/app/telegram';
import { mathFunction } from '@b/lib/appUtils';

const modifiedValue = (valueFromSubmenu: string, value: string): string => {
    return value.includes(config.modifiedValue)
        ? value.replace(config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};

export const _getDynamicValueIfIsIn = async (adapter: Adapter, text: string): Promise<string | number | boolean> => {
    const startValue = '{id:';
    const endValue = '}';
    if (text.includes(startValue)) {
        const { substring, substringExcludeSearch: id } = decomposeText(text, startValue, endValue);

        const state = await adapter.getForeignStateAsync(removeQuotes(id));

        if (!isDefined(state?.val)) {
            adapter.log.warn(`State with id ${id} not found or has no value`);
            return removeDuplicateSpaces(text.replace(substring, ''));
        }
        if (!text.includes('{math:')) {
            const res = removeDuplicateSpaces(text.replace(substring, ''));
            return exchangeValue(adapter, res, String(state.val), true).textToSend;
        }

        const newValue = text.replace(substring, '');

        const { error, textToSend, calculated } = mathFunction(newValue, String(state?.val), adapter);

        return error ? String(state?.val) : exchangeValue(adapter, textToSend, String(calculated), true).textToSend;
    }

    return removeDuplicateSpaces(text);
};

export const setstateIobroker = async ({
    id,
    value,
    ack,
    adapter,
}: {
    adapter: Adapter;
    id: string;
    value: string | number | boolean;
    ack: boolean;
}): Promise<void> => {
    try {
        const val = await transformValueToTypeOfId(adapter, id, value);

        adapter.log.debug(`Value to Set: ${jsonString(val)}`);
        if (isDefined(val)) {
            await adapter.setForeignStateAsync(id, val, ack);
        }
    } catch (error: any) {
        errorLogger('Error Setstate', error, adapter);
    }
};

const setValue = async (
    adapter: Adapter,
    id: string,
    value: string,
    valueFromSubmenu: null | string | number | boolean,
    ack: boolean,
): Promise<string | number | boolean | undefined> => {
    try {
        adapter.log.debug(`Value to Set: ${jsonString(value)}`);
        const valueToSet =
            isDefined(value) && isNonEmptyString(value)
                ? await _getDynamicValueIfIsIn(adapter, value)
                : modifiedValue(String(valueFromSubmenu), value);
        adapter.log.debug(`Value to Set: ${jsonString(valueToSet)}`);
        await setstateIobroker({ adapter, id, value: valueToSet, ack });
        return valueToSet;
    } catch (error: any) {
        errorLogger('Error setValue', error, adapter);
    }
};

const foreignIdStart = '{"foreignId":"';

function handleUpdateFromForeignId(returnText: string): boolean {
    return returnText.includes(foreignIdStart);
}

export const handleSetState = async (
    adapter: Adapter,
    instance: string,
    part: Part,
    userToSend: string,
    valueFromSubmenu: null | string | number | boolean,
    telegramParams: TelegramParams,
): Promise<Telegram | undefined> => {
    try {
        if (!part.switch) {
            return;
        }
        for (const { returnText: text, id: switchId, parse_mode, confirm, ack, toggle, value } of part.switch) {
            let idToGetValueFrom = switchId;
            let returnText = text;

            const useForeignId = handleUpdateFromForeignId(returnText);
            if (returnText.includes('{setDynamicValue')) {
                const { confirmText, id } = await setDynamicValue(
                    instance,
                    returnText,
                    ack,
                    idToGetValueFrom,
                    userToSend,
                    telegramParams,
                    parse_mode,
                    confirm,
                );

                if (confirm) {
                    await addSetStateIds(adapter, {
                        id: id ?? idToGetValueFrom,
                        confirm,
                        returnText: confirmText,
                        userToSend,
                    });
                }
                return;
            }
            let valueToTelegram: ioBroker.StateValue = valueFromSubmenu ?? value;
            if (!useForeignId) {
                await addSetStateIds(adapter, {
                    id: idToGetValueFrom,
                    confirm,
                    returnText,
                    userToSend,
                    parse_mode,
                });
            } else {
                returnText = singleQuotesToDoubleQuotes(returnText);
                const { substring } = decomposeText(returnText, foreignIdStart, '}');
                const { json, isValidJson } = parseJSON<{ text: string; foreignId: string }>(substring);

                if (!isValidJson) {
                    return;
                }

                if (json.foreignId) {
                    idToGetValueFrom = json.foreignId;
                    returnText = returnText.replace(substring, json.text);
                }

                await addSetStateIds(adapter, {
                    id: json.foreignId,
                    confirm: true,
                    returnText: json.text,
                    userToSend: userToSend,
                });
            }

            if (toggle) {
                const state = await adapter.getForeignStateAsync(switchId);
                const newValue = state ? !state.val : false;
                await setstateIobroker({ adapter, id: switchId, value: newValue, ack });

                valueToTelegram = newValue;
            } else {
                const modifiedValue = await setValue(adapter, switchId, value, valueFromSubmenu, ack);
                if (isDefined(modifiedValue)) {
                    valueToTelegram = modifiedValue;
                }
            }

            if (useForeignId) {
                const state = await adapter.getForeignStateAsync(idToGetValueFrom);
                valueToTelegram = state ? state.val : valueToTelegram;
            }

            if (confirm) {
                let { textToSend } = exchangeValue(adapter, singleQuotesToDoubleQuotes(returnText), valueToTelegram);

                let i = 0;
                while (textToSend.includes('{id:') && i < 20) {
                    textToSend = String(await _getDynamicValueIfIsIn(adapter, textToSend));
                    i++;
                }
                const telegramData: Telegram = {
                    instance,
                    userToSend,
                    textToSend,
                    telegramParams,
                    parse_mode,
                };
                await sendToTelegram(telegramData);
                return telegramData;
            }
        }
    } catch (error: any) {
        errorLogger('Error Switch', error, adapter);
    }
};
