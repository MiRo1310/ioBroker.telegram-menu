import { isDefined } from './utils';
import { decomposeText, getValueToExchange } from './string';
import { errorLogger } from '../app/logging';
import { extractTimeValues, getTimeWithPad, integrateTimeIntoText } from './time';
import type { ProzessTimeValue } from '../types/types';
import { adapter } from '../main';
import { config } from '../config/config';
import { getTypeofTimestamp, timeStringReplacer } from './appUtils';

const processTimeIdLc = async (textToSend: string, id: string | null): Promise<string | undefined> => {
    const { substring } = decomposeText(textToSend, config.timestamp.start, config.timestamp.end); //{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'ID'}
    const array = substring.split(',');

    let changedSubstring = substring;
    changedSubstring = changedSubstring.replace(array[0], '');
    const key = getTypeofTimestamp(array[0]);

    let idFromText = '';
    if (!id) {
        if (!changedSubstring.includes('id:')) {
            adapter.log.debug(`Error processTimeIdLc: id not found in: ${changedSubstring}`);
            return;
        }

        if (array[2]) {
            idFromText = array[2].replace('id:', '').replace('}', '').replace(/'/g, '');
            changedSubstring = changedSubstring.replace(array[2], '').replace(/,/g, '');
        }
    }
    if (!id && !idFromText) {
        return;
    }
    const value = await adapter.getForeignStateAsync(id || idFromText);
    let unixTs;
    let timeStringUser;
    if (key && value) {
        timeStringUser = changedSubstring.replace(',(', '').replace(')', '').replace('}', '');
        unixTs = value[key];
    }
    if (!unixTs) {
        return;
    }

    const timeWithPad = getTimeWithPad(extractTimeValues(unixTs));
    const timeStringReplaced = timeStringReplacer(timeWithPad, timeStringUser);

    return timeStringReplaced ?? textToSend;
};

// TODO Check Usage of function
const checkStatus = async (text: string, processTimeValue?: ProzessTimeValue): Promise<string> => {
    try {
        const substring = decomposeText(text, '{status:', '}').substring;
        let id, valueChange;
        adapter.log.debug(`Substring ${substring}`);
        if (substring.includes("status:'id':")) {
            id = substring.split(':')[2].replace("'}", '').replace(/'/g, '').replace(/}/g, '');

            valueChange = substring.split(':')[3] ? substring.split(':')[3].replace('}', '') !== 'false' : true;
        } else {
            id = substring.split(':')[1].replace("'}", '').replace(/'/g, '').replace(/}/g, '');
            valueChange = substring.split(':')[2] ? substring.split(':')[2].replace('}', '') !== 'false' : true;
        }

        const stateValue = await adapter.getForeignStateAsync(id);

        if (!stateValue) {
            adapter.log.debug(`State not found: ${id}`);
            return '';
        }

        if (text.includes('{time}') && processTimeValue) {
            text = text.replace(substring, '');

            const val = String(stateValue.val);
            return processTimeValue(text, val).replace(val, '');
        }
        if (!isDefined(stateValue.val)) {
            adapter.log.debug(`State Value is undefined: ${id}`);
            return text.replace(substring, '');
        }
        if (!valueChange) {
            return text.replace(substring, stateValue.val.toString());
        }
        const { newValue: val, textToSend, error } = getValueToExchange(adapter, text, stateValue.val);
        let newValue;
        if (!error) {
            text = textToSend;
            newValue = val;
        } else {
            newValue = stateValue.val;
        }
        adapter.log.debug(`CheckStatus Text: ${text} Substring: ${substring}`);
        adapter.log.debug(`CheckStatus Return Value: ${text.replace(substring, newValue.toString())}`);

        return text.replace(substring, newValue.toString());
    } catch (e: any) {
        adapter.log.error(`Error checkStatus:${e.message}`);
        adapter.log.error(`Stack:${e.stack}`);

        return '';
    }
};
const checkStatusInfo = async (text: string): Promise<string> => {
    try {
        if (!text) {
            return '';
        }
        adapter.log.debug(`Text: ${text}`);

        if (text.includes('{status:')) {
            while (text.includes('{status:')) {
                text = await checkStatus(text, integrateTimeIntoText);
            }
        }
        if (text.includes('{time.lc') || text.includes('{time.ts')) {
            text = (await processTimeIdLc(text, null)) || '';
        }
        if (text.includes('{set:')) {
            const result = decomposeText(text, '{set:', '}');
            const id = result.substring.split(',')[0].replace("{set:'id':", '').replace(/'/g, '');
            const importedValue = result.substring.split(',')[1];

            text = result.textExcludeSubstring;
            const convertedValue = await checkTypeOfId(id, importedValue);

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

async function checkTypeOfId(
    id: string,
    value: ioBroker.State | ioBroker.StateValue | ioBroker.SettableState,
): Promise<ioBroker.State | null | undefined | ioBroker.StateValue | ioBroker.SettableState> {
    try {
        adapter.log.debug(`Check Type of Id: ${id}`);
        const obj = await adapter.getForeignObjectAsync(id);
        const receivedType = typeof value;
        if (!obj || !value) {
            return value;
        }
        if (receivedType === obj.common.type || !obj.common.type) {
            return value;
        }

        adapter.log.debug(`Change Value type from  "${receivedType}" to "${obj.common.type}"`);

        if (obj.common.type === 'boolean') {
            if (value == 'true') {
                value = true;
            }
            if (value == 'false') {
                value = false;
            }
            return value;
        }
        if (obj.common.type === 'string') {
            return JSON.stringify(value);
        }
        if (obj && obj.common && obj.common.type === 'number' && typeof value === 'string') {
            return parseFloat(value);
        }

        return value;
    } catch (e: any) {
        errorLogger('Error checkTypeOfId:', e, adapter);
    }
}

export { checkStatusInfo, checkTypeOfId, processTimeIdLc };
