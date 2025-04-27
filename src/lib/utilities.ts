import { isDefined, isTruthy } from './utils';
import { decomposeText, getValueToExchange, jsonString, replaceAllItems } from './string';
import { errorLogger } from '../app/logging';
import { extractTimeValues, getTimeWithPad, integrateTimeIntoText } from './time';
import { adapter } from '../main';
import { config } from '../config/config';
import { getTypeofTimestamp, statusIdAndParams, timeStringReplacer } from './appUtils';

export const processTimeIdLc = async (textToSend: string, id?: string): Promise<string> => {
    const { substring, substringExcludeSearch } = decomposeText(
        textToSend,
        config.timestamp.start,
        config.timestamp.end,
    ); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const array = substringExcludeSearch.split(','); //["lc","(DD MM YYYY hh:mm:ss:sss)","id:'ID'"]
    const timestampString = array[0];
    const timeString = array[1]; //"(DD MM YYYY hh:mm:ss:sss)"
    const idString = array[2];

    const typeofTimestamp = getTypeofTimestamp(timestampString); //"{time.lc"

    const idFromText = replaceAllItems(idString, ['id:', '}', "'"]); //"id:'ID'"

    if (!id && (!idFromText || idFromText.length < 5)) {
        return textToSend.replace(substring, 'Invalid ID');
    }
    const value = await adapter.getForeignStateAsync(id ?? idFromText);

    if (!value) {
        return textToSend.replace(substring, 'Invalid ID');
    }
    const timeStringUser = replaceAllItems(timeString, [',(', ')', '}']); //"(DD MM YYYY hh:mm:ss:sss)"
    const unixTs = value[typeofTimestamp];

    const timeWithPad = getTimeWithPad(extractTimeValues(unixTs));
    const timeStringReplaced = timeStringReplacer(timeWithPad, timeStringUser);

    return timeStringReplaced ?? textToSend;
};

// TODO Check Usage of function
export const checkStatus = async (text: string): Promise<string> => {
    const { substring, substringExcludeSearch } = decomposeText(text, config.status.start, config.status.end); //substring {status:'ID':true} new | old {status:'id':'ID':true}
    adapter.log.debug(text);
    adapter.log.debug(substring);
    adapter.log.debug(substringExcludeSearch);
    const { id, shouldChange } = statusIdAndParams(substringExcludeSearch);

    const stateValue = await adapter.getForeignStateAsync(id);

    if (!isDefined(stateValue?.val)) {
        adapter.log.debug(`State not found: ${id}`);
        return text.replace(substring, '');
    }

    if (text.includes(config.time)) {
        text = text.replace(substring, '');

        const val = String(stateValue.val);
        return integrateTimeIntoText(text, val).replace(val, '');
    }

    if (!shouldChange) {
        return text.replace(substring, stateValue.val.toString());
    }

    const { newValue: val, textToSend, error } = getValueToExchange(adapter, text, stateValue.val);

    text = !error ? textToSend : text;
    const newValue = !error ? val : stateValue.val;

    adapter.log.debug(`CheckStatus Text: ${text} Substring: ${substring}`);

    return text.replace(substring, newValue.toString());
};

export const checkStatusInfo = async (text: string): Promise<string> => {
    try {
        adapter.log.debug(`Check status Info: ${text}`);

        if (text.includes(config.status.start)) {
            while (text.includes(config.status.start)) {
                text = await checkStatus(text);
            }
        }
        if (text.includes(config.timestamp.lc) || text.includes(config.timestamp.ts)) {
            text = await processTimeIdLc(text);
        }
        if (text.includes(config.set.start)) {
            const result = decomposeText(text, config.set.start, config.set.end);
            const id = result.substring.split(',')[0].replace("{set:'id':", '').replace(/'/g, '');
            const importedValue = result.substring.split(',')[1];

            text = result.textExcludeSubstring;
            const convertedValue = await transformValueToTypeOfId(id, importedValue);

            const ack = result.substring.split(',')[2].replace('}', '') == 'true';

            if (text === '') {
                text = 'Wähle eine Aktion';
            }
            if (convertedValue) {
                await adapter.setForeignStateAsync(id, convertedValue, ack);
            }
        }
        if (text) {
            adapter.log.debug(`CheckStatusInfo: ${text}`);
            return text;
        }
        return '';
    } catch (e: any) {
        errorLogger('Error checkStatusInfo:', e, adapter);
        return '';
    }
};

export async function transformValueToTypeOfId(
    id: string,
    value: ioBroker.StateValue,
): Promise<ioBroker.StateValue | undefined> {
    try {
        const receivedType = typeof value;

        const obj = await adapter.getForeignObjectAsync(id);

        if (!obj || !isDefined(value)) {
            return;
        }

        if (receivedType === obj.common.type || !obj.common.type) {
            return value;
        }

        adapter.log.debug(`Change Value type from  "${receivedType}" to "${obj.common.type}"`);

        switch (obj.common.type) {
            case 'string':
                return value as string;
            case 'number':
                return parseFloat(jsonString(value));
            case 'boolean':
                return isTruthy(value);
        }

        return value;
    } catch (e: any) {
        errorLogger('Error checkTypeOfId:', e, adapter);
    }
}
