import { isDefined } from '@b/lib/utils';
import { checkStatus } from '../app/status';
import type { Adapter } from '../types/types';
import { getProcessTimeValues } from '@b/lib/splitValues';
import { decomposeText, isEmptyString, jsonString, replaceAllItems } from '@b/lib/string';
import { invalidId, config } from '@b/config/config';
import { isSameType, timeStringReplacer } from '@b/lib/appUtils';
import { extractTimeValues, getTimeWithPad } from '@b/lib/time';
import { setstateIobroker } from '@b/app/setstate';
import { errorLogger } from '@b/app/logging';

export const setTimeValue = async (adapter: any, textToSend: string, id?: string): Promise<string> => {
    const { substring, substringExcludeSearch } = decomposeText(
        textToSend,
        config.timestamp.start,
        config.timestamp.end,
    ); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const { typeofTimestamp, timeString, idString } = getProcessTimeValues(substringExcludeSearch);

    if (!id && (!idString || idString.length < 5)) {
        return textToSend.replace(substring, invalidId);
    }
    const value = await adapter.getForeignStateAsync(id ?? idString);

    if (!value) {
        return textToSend.replace(substring, invalidId);
    }
    const formattedTimeParams = replaceAllItems(timeString, [',(', '(', ')', '}']); //"(DD MM YYYY hh:mm:ss:sss)"
    const unixTs = value[typeofTimestamp];

    const timeWithPad = getTimeWithPad(extractTimeValues(unixTs));
    const formattedTime = timeStringReplacer(timeWithPad, formattedTimeParams);

    return formattedTime ? textToSend.replace(substring, formattedTime) : textToSend;
};

export const textModifier = async (adapter: Adapter, text?: string): Promise<string> => {
    if (!text) {
        return '';
    }
    try {
        const inputText = text;

        while (text.includes(config.status.start)) {
            text = await checkStatus(adapter, text);
        }

        if (text.includes(config.timestamp.lc) || text.includes(config.timestamp.ts)) {
            text = await setTimeValue(adapter, text);
        }
        if (text.includes(config.set.start)) {
            const { substring, textExcludeSubstring } = decomposeText(text, config.set.start, config.set.end);
            const [idString, importedValue, ackString] = substring.split(',') as (string | undefined)[];
            const id = idString?.replace("{set:'id':", '').replace(/'/g, '');

            text = textExcludeSubstring;
            const convertedValue =
                id && importedValue ? await transformValueToTypeOfId(adapter, id, importedValue) : undefined;

            const ack = ackString?.replace('}', '') == 'true' || false;

            if (isEmptyString(text)) {
                text = 'Wähle eine Aktion';
            }
            if (convertedValue && id) {
                await setstateIobroker({ adapter, id, value: convertedValue, ack });
            }
        }

        text === inputText
            ? adapter.log.debug(`Return text : ${text} `)
            : adapter.log.debug(`Return text was modified from "${inputText}" to "${text}" `);
        return text;
    } catch (e: any) {
        errorLogger('Error returnTextModifier:', e, adapter);
        return '';
    }
};

export async function transformValueToTypeOfId(
    adapter: Adapter,
    id: string,
    value: ioBroker.StateValue,
): Promise<ioBroker.StateValue | undefined> {
    try {
        const receivedType = typeof value;

        const obj = await adapter.getForeignObjectAsync(id);

        if (!obj || !isDefined(value) || isSameType(receivedType, obj)) {
            return value;
        }

        adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);

        switch (obj.common.type) {
            case 'string':
                return String(value);
            case 'number':
                return typeof value === 'string' ? parseFloat(value) : parseFloat(jsonString(value));
            case 'boolean':
                return isDefined(value) && !['false', false, 0, '0', 'null', 'undefined'].includes(value);
            default:
                return value;
        }
    } catch (e: any) {
        errorLogger('Error checkTypeOfId:', e, adapter);
    }
}
