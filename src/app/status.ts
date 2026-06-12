import { decomposeText } from '../lib/string';
import { config } from '../config/config';
import { statusIdAndParams } from '../lib/appUtils';
import { isDefined } from '../lib/utils';
import { integrateTimeIntoText } from '../lib/time';
import { exchangeValue } from '../lib/exchangeValue';
import type { AppContext } from '@backend/app/appContext';

export const checkStatus = async (appContext: AppContext, text: string): Promise<string> => {
    const { substring, substringExcludeSearch, textExcludeSubstring } = decomposeText(
        text,
        config.status.start,
        config.status.end,
    ); //substring {status:'ID':true} new | old {status:'id':'ID':true}

    const { id, shouldChangeByStatusParameter } = statusIdAndParams(substringExcludeSearch);
    const stateValue = await appContext.adapter.getForeignStateAsync(id);

    if (!isDefined(stateValue?.val)) {
        appContext.adapter.log.debug(`State not found for id : "${id}"`);
        return text.replace(substring, '');
    }

    const stateValueString = String(stateValue.val);

    if (text.includes(config.time)) {
        return integrateTimeIntoText(textExcludeSubstring, stateValueString).replace(stateValueString, '');
    }

    const modifiedText = text.replace(substring, '&&');
    const { textToSend, error } = exchangeValue(
        appContext,
        modifiedText,
        stateValue.val,
        shouldChangeByStatusParameter,
    );
    return !error ? textToSend : modifiedText;
};
