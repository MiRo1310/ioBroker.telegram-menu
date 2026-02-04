import { config } from '@b/config/config';
import type { Adapter, Part, Telegram, TelegramParams } from '@b/types/types';
import { decomposeText, isNonEmptyString, jsonString, parseJSON } from '@b/lib/string';
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

export const _setDynamicValueIfIsIn = async (
    adapter: Adapter,
    value: string | number | boolean,
): Promise<string | number | boolean> => {
    const startValue = '{id:';
    const endValue = '}';

    if (typeof value === 'string' && value.includes(startValue)) {
        const { substring, substringExcludeSearch: id } = decomposeText(value, startValue, endValue);

        const state = await adapter.getForeignStateAsync(id);

        if (!isDefined(state?.val)) {
            return value;
        }
        if (!value.includes('{math:')) {
            return value.replace(substring, String(state?.val));
        }
        const newValue = value.replace(substring, '');

        const { error, textToSend, calculated } = mathFunction(newValue, String(state?.val), adapter);

        return error ? String(state?.val) : exchangeValue(adapter, textToSend, String(calculated), true).textToSend;
    }
    return value;
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
                ? await _setDynamicValueIfIsIn(adapter, value)
                : modifiedValue(String(valueFromSubmenu), value);
        adapter.log.debug(`Value to Set: ${jsonString(valueToSet)}`);
        await setstateIobroker({ adapter, id, value: valueToSet, ack });
        return valueToSet;
    } catch (error: any) {
        errorLogger('Error setValue', error, adapter);
    }
};

const foreignIdStart = "{'foreignId':'";

function handleUpdateFromForeignId(returnText: string): boolean {
    return returnText.includes(foreignIdStart);
}

export const handleSetState = async (
    instance: string,
    part: Part,
    userToSend: string,
    valueFromSubmenu: null | string | number | boolean,
    telegramParams: TelegramParams,
): Promise<Telegram | undefined> => {
    const adapter = telegramParams.adapter;
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
                returnText = returnText.replace(/'/g, '"');
                const { substring } = decomposeText(returnText, foreignIdStart, '}');
                const { json, isValidJson } = parseJSON<{ text: string; id: string }>(substring);

                if (!isValidJson) {
                    return;
                }

                if (json.id) {
                    idToGetValueFrom = json.id;
                    returnText = returnText.replace(substring, json.text);
                }

                await addSetStateIds(adapter, {
                    id: json.id,
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
                //TODO
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
                const { textToSend } = exchangeValue(adapter, returnText, valueToTelegram);
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
