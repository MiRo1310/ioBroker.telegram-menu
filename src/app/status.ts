import type TelegramMenu from '../main';
import { decomposeText } from '../lib/string';
import { config } from '../config/config';
import { statusIdAndParams } from '../lib/appUtils';
import { isDefined } from '../lib/utils';
import { integrateTimeIntoText } from '../lib/time';
import { exchangeValue } from '../lib/exchangeValue';

export const checkStatus = async (adapter: TelegramMenu, text: string): Promise<string> => {
    const { substring, substringExcludeSearch, textExcludeSubstring } = decomposeText(
        text,
        config.status.start,
        config.status.end,
    ); //substring {status:'ID':true} new | old {status:'id':'ID':true}

    const { id, shouldChangeByStatusParameter } = statusIdAndParams(substringExcludeSearch);

    const stateValue = await adapter.getForeignStateAsync(id);

    if (!isDefined(stateValue?.val)) {
        adapter.log.debug(`State not found for id : "${id}"`);
        return text.replace(substring, '');
    }

    const stateValueString = String(stateValue.val);

    if (text.includes(config.time)) {
        return integrateTimeIntoText(textExcludeSubstring, stateValueString).replace(stateValueString, '');
    }

    const modifiedText = text.replace(substring, '&&');
    const { textToSend, error } = exchangeValue(adapter, modifiedText, stateValue.val, shouldChangeByStatusParameter);
    return !error ? textToSend : modifiedText;
};
