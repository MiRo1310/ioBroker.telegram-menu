import { isDefined } from '@backend/lib/utils';
import { checkStatus } from '../app/status';
import type { Adapter } from '../types/types';
import { getProcessTimeValues } from '@backend/lib/splitValues';
import { decomposeText, replaceAllItems } from '@backend/lib/string';
import { invalidId, config } from '@backend/config/config';
import { isSameType, timeStringReplacer } from '@backend/lib/appUtils';
import { extractTimeValues, getTimeWithPad } from '@backend/lib/time';
import { setstateIobroker } from '@backend/app/setstate';
import type { AppContext } from '@backend/app/appContext';

export const getTimeValue = async (
    appContext: AppContext,
    textToSend: string,
    optionalId?: string,
): Promise<string> => {
    const { substring, substringExcludeSearch } = decomposeText(
        textToSend,
        config.timestamp.start,
        config.timestamp.end,
    ); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const { typeofTimestamp, timeString, idString } = getProcessTimeValues(substringExcludeSearch);
    if (!optionalId && (!idString || idString.length < 5)) {
        return invalidId;
    }
    const id = (optionalId ?? idString).replace(/'/g, '').replace(/"/g, '');
    const value = await appContext.adapter.getForeignStateAsync(id);

    if (!value) {
        return invalidId;
    }
    const formattedTimeParams = replaceAllItems(timeString, [',(', '(', ')', '}']); //"(DD MM YYYY hh:mm:ss:sss)"
    const unixTs = value[typeofTimestamp];

    const timeWithPad = getTimeWithPad(extractTimeValues(unixTs));
    const formattedTime = timeStringReplacer(timeWithPad, formattedTimeParams);

    return textToSend.replace(substring, formattedTime).trim();
};

export const changeToNumber = (adapter: Adapter, value: string | number): number | undefined => {
    const val = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(val)) {
        adapter.log.warn(`Value "${value}" is not a valid number. Returning NaN.`);
        return;
    }
    return val;
};

export const textModifier = async (appContext: AppContext, text?: string): Promise<string> => {
    if (!text) {
        return '';
    }
    const inputText = text;

    while (text.includes(config.status.start)) {
        text = await checkStatus(appContext, text);
    }

    if (text.includes(config.timestamp.lc) || text.includes(config.timestamp.ts)) {
        text = await getTimeValue(appContext, text);
    }
    if (text.includes(config.set.start)) {
        const { substring, textExcludeSubstring } = decomposeText(text, config.set.start, config.set.end);

        const [idString, importedValue, ackString] = (substring.split(',') as (string | undefined)[]).map(i =>
            i?.replace(/}/g, ''),
        );
        const id = idString?.replace("{set:'id':", '').replace(/'/g, '');

        text = textExcludeSubstring;
        const convertedValue =
            id && importedValue ? await transformValueToTypeOfId(appContext, id, importedValue) : undefined;

        const ack = ackString?.replace('}', '') == 'true' || false;

        if (convertedValue && id) {
            await setstateIobroker(appContext, id, convertedValue, ack);
        }
    }

    text === inputText
        ? appContext.adapter.log.debug(`Return text : ${text} `)
        : appContext.adapter.log.debug(`Return text was modified from "${inputText}" to "${text}" `);
    return text;
};

export async function transformValueToTypeOfId(
    appContext: AppContext,
    id: string,
    value: ioBroker.StateValue,
): Promise<ioBroker.StateValue | undefined> {
    const receivedType = typeof value;

    const obj = await appContext.adapter.getForeignObjectAsync(id);

    if (!obj || !isDefined(value) || isSameType(receivedType, obj)) {
        return value;
    }

    appContext.adapter.log.debug(`Change Value type from "${receivedType}" to "${obj.common.type}"`);

    switch (obj.common.type) {
        case 'string':
            return String(value);
        case 'number':
            return changeToNumber(appContext.adapter, value as string | number);
        case 'boolean':
            return isDefined(value) && !['false', false, 0, '0', 'null', 'undefined'].includes(value);
        default:
            return value;
    }
}
