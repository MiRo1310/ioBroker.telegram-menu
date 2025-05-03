import { replaceAllItems } from './string';
import { getTypeofTimestamp } from './appUtils';

export const getMenuValues = (str: string): { callbackData: string; device?: string; val?: string } => {
    const splitText = str.split(':');
    return { callbackData: splitText[1], device: splitText[2], val: splitText[3] };
};

export function getProcessTimeValues(substringExcludeSearch: string): {
    typeofTimestamp: 'lc' | 'ts';
    timeString: string;
    idString: string;
} {
    const array = substringExcludeSearch.split(','); //["lc","(DD MM YYYY hh:mm:ss:sss)","id:'ID'"]
    return {
        typeofTimestamp: getTypeofTimestamp(array[0]),
        timeString: array[1] ?? '',
        idString: replaceAllItems(array[2] ?? '', ['id:', '}', "'"]),
    };
}

export function getBindingValues(item: string): { key: string; id?: string } {
    const array = item.split(':');

    return { key: array[0], id: array[1] };
}
