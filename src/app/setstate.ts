import { config } from '@backend/config/config';
import type { Part, Telegram } from '@backend/types/types';
import {
    decomposeText,
    isNonEmptyString,
    jsonString,
    parseJSON,
    removeDuplicateSpaces,
    removeQuotes,
    singleQuotesToDoubleQuotes,
} from '@backend/lib/string';
import { transformValueToTypeOfId } from '@backend/lib/utilities';
import { isDefined } from '@backend/lib/utils';
import { exchangeValue } from '@backend/lib/exchangeValue';
import { sendToTelegram } from '@backend/app/telegram';
import { mathFunction } from '@backend/lib/appUtils';
import { dynamicValue } from '@backend/app/dynamicValue';
import type { AppContext } from '@backend/app/appContext';

const modifiedValue = (valueFromSubmenu: string, value: string): string => {
    /* istanbul ignore next */
    return value.includes(config.modifiedValue)
        ? value.replace(config.modifiedValue, valueFromSubmenu)
        : valueFromSubmenu;
};

export const _getDynamicValueIfIsIn = async (
    appContext: AppContext,
    text: string,
): Promise<string | number | boolean> => {
    const startValue = '{id:';
    const endValue = '}';
    if (text.includes(startValue)) {
        const { substring, substringExcludeSearch: id } = decomposeText(text, startValue, endValue);

        const state = await appContext.adapter.getForeignStateAsync(removeQuotes(id));

        if (!isDefined(state?.val)) {
            appContext.adapter.log.warn(`State with id ${id} not found or has no value`);
            return removeDuplicateSpaces(text.replace(substring, ''));
        }
        if (!text.includes('{math:')) {
            const res = removeDuplicateSpaces(text.replace(substring, ''));
            return exchangeValue(appContext, res, String(state.val), true).textToSend;
        }

        const newValue = text.replace(substring, '');

        const { error, textToSend, calculated } = mathFunction(newValue, String(state?.val), appContext.adapter);

        /* istanbul ignore next */
        return error ? String(state?.val) : exchangeValue(appContext, textToSend, String(calculated), true).textToSend;
    }

    return removeDuplicateSpaces(text);
};

export const setstateIobroker = async ({
    id,
    value,
    ack,
    appContext,
}: {
    appContext: AppContext;
    id: string;
    value: string | number | boolean;
    ack: boolean;
}): Promise<void> => {
    const val = await transformValueToTypeOfId(appContext, id, value);

    appContext.adapter.log.debug(`Value to Set: ${jsonString(val)}`);
    if (isDefined(val)) {
        await appContext.adapter.setForeignStateAsync(id, val, ack);
    }
};

const setValue = async (
    appContext: AppContext,
    id: string,
    value: string,
    valueFromSubmenu: null | string | number | boolean,
    ack: boolean,
): Promise<string | number | boolean | undefined> => {
    appContext.adapter.log.debug(`Value to Set: ${jsonString(value)}`);
    const valueToSet =
        isDefined(value) && isNonEmptyString(value)
            ? await _getDynamicValueIfIsIn(appContext, value)
            : modifiedValue(String(valueFromSubmenu), value ?? '');
    appContext.adapter.log.debug(`Value to Set: ${jsonString(valueToSet)}`);
    await setstateIobroker({ appContext, id, value: valueToSet, ack });
    return valueToSet;
};

const foreignIdStart = '{"foreignId":"';

function handleUpdateFromForeignId(returnText: string): boolean {
    return returnText.includes(foreignIdStart);
}

export async function exchangeValueAndSendToTelegram(
    appContext: AppContext,
    returnText: string,
    valueToTelegram: string | number | null | boolean,
    instance: string,
    userToSend: string,
    parse_mode: boolean,
): Promise<Telegram> {
    let { textToSend } = exchangeValue(appContext, singleQuotesToDoubleQuotes(returnText), valueToTelegram);

    let i = 0;
    while (textToSend.includes('{id:') && i < 20) {
        textToSend = String(await _getDynamicValueIfIsIn(appContext, textToSend));
        i++;
    }
    const telegramData: Telegram = {
        instance,
        userToSend,
        textToSend,
        appContext,
        parse_mode,
    };
    await sendToTelegram(telegramData);
    return telegramData;
}

export const handleSetState = async (
    appContext: AppContext,
    instance: string,
    part: Part,
    userToSend: string,
    valueFromSubmenu: null | string | number | boolean,
): Promise<Telegram | undefined> => {
    if (!part.switch) {
        return;
    }
    for (const { returnText: text, id: switchId, parse_mode, confirm, ack, toggle, value } of part.switch) {
        let idToGetValueFrom = switchId;
        let returnText = text;

        const useForeignId = handleUpdateFromForeignId(returnText);
        if (returnText.includes('{setDynamicValue')) {
            const { confirmText, id } = await dynamicValue.setValue(
                instance,
                returnText,
                ack,
                idToGetValueFrom,
                userToSend,
                appContext,
                parse_mode,
                confirm,
            );

            if (confirm && id) {
                await appContext.stateIdRegistry.addIds(appContext.adapter, {
                    id,
                    confirm,
                    returnText: confirmText,
                    userToSend,
                    instance,
                });
            }
            return;
        }
        let valueToTelegram: ioBroker.StateValue = valueFromSubmenu ?? value;
        if (useForeignId) {
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

            await appContext.stateIdRegistry.addIds(appContext.adapter, {
                id: json.foreignId,
                confirm: true,
                returnText: json.text,
                userToSend: userToSend,
                instance,
            });
        }

        if (toggle) {
            const state = await appContext.adapter.getForeignStateAsync(switchId);
            const newValue = state ? !state.val : false;
            await setstateIobroker({ appContext, id: switchId, value: newValue, ack });

            valueToTelegram = newValue;
        } else {
            const modifiedValue = await setValue(appContext, switchId, value, valueFromSubmenu, ack);
            if (isDefined(modifiedValue)) {
                valueToTelegram = modifiedValue;
            }
        }

        if (useForeignId) {
            const state = await appContext.adapter.getForeignStateAsync(idToGetValueFrom);
            /* istanbul ignore next */
            valueToTelegram = state ? state.val : valueToTelegram;
        }

        if (confirm && !useForeignId) {
            if (appContext.stateIdRegistry.getIds().some(e => e.id === idToGetValueFrom)) {
                appContext.adapter.log.error(
                    `Double-send detected: ID "${idToGetValueFrom}" is registered in stateIdRegistry AND confirm-path fires — check confirm/useForeignId logic.`,
                );
            }
            return await exchangeValueAndSendToTelegram(
                appContext,
                returnText,
                valueToTelegram,
                instance,
                userToSend,
                parse_mode,
            );
        }
    }
};
