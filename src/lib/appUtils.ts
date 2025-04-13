import { config } from '../config/config';
import type { Adapter, GetTimeWithPad, MenusWithUsers, ParseModeType } from '../types/types';
import { decomposeText, removeQuotes } from './string';
import { evaluate } from './math';
import { isTruthy } from './utils';

export const checkOneLineValue = (text: string): string =>
    !text.includes(config.rowSplitter) ? `${text} ${config.rowSplitter}` : text;

export function calcValue(
    textToSend: string,
    val: string,
    adapter: Adapter,
): { textToSend: string; val: any; error: boolean } {
    const { substringExcludeSearch, textExcludeSubstring } = decomposeText(
        textToSend,
        config.math.start,
        config.math.end,
    );
    const { val: evalVal, error } = evaluate([val, substringExcludeSearch], adapter);

    return error
        ? { textToSend: textExcludeSubstring, val, error }
        : { textToSend: textExcludeSubstring, val: evalVal, error };
}

export function roundValue(val: string, textToSend: string): { val: string; textToSend: string; error: boolean } {
    const floatVal = parseFloat(val);
    const { textExcludeSubstring, substringExcludeSearch: decimalPlaces } = decomposeText(
        textToSend,
        config.round.start,
        config.round.end,
    );
    const decimalPlacesNum = parseInt(decimalPlaces);

    if (isNaN(floatVal)) {
        return { val: 'NaN', textToSend: textExcludeSubstring, error: true };
    }
    if (isNaN(decimalPlacesNum)) {
        return { val, textToSend: textExcludeSubstring, error: true };
    }

    return { val: floatVal.toFixed(decimalPlacesNum), textToSend: textExcludeSubstring, error: false };
}

export const getListOfMenusIncludingUser = (menusWithUsers: MenusWithUsers, userToSend: string): string[] => {
    const menus: string[] = [];
    for (const key in menusWithUsers) {
        if (menusWithUsers[key].includes(userToSend)) {
            menus.push(key);
        }
    }
    return menus;
};

export const getParseMode = (val = false): ParseModeType => (val ? 'HTML' : 'Markdown');

export const getTypeofTimestamp = (val: string): 'lc' | 'ts' => (val.includes('lc') ? 'lc' : 'ts');

export const timeStringReplacer = ({ d, h, m, ms, y, s, mo }: GetTimeWithPad, string?: string): string | undefined => {
    if (string) {
        string = string
            .replace('sss', ms)
            .replace('ss', s)
            .replace('mm', m)
            .replace('hh', h)
            .replace('DD', d)
            .replace('MM', mo)
            .replace('YYYY', y)
            .replace('YY', y.slice(-2))
            .replace('(', '')
            .replace(')', '');
    }
    return string;
};

export function statusIdAndParams(substringExcludeSearch: string): { id: string; shouldChange: boolean } {
    if (substringExcludeSearch.includes(config.status.oldWithId)) {
        const splitArray = substringExcludeSearch.split(':');
        console.log(splitArray);
        return {
            id: removeQuotes(splitArray[1]), //'id':'ID':true
            shouldChange: isTruthy(removeQuotes(splitArray[2])),
        };
    }
    const splitArray = substringExcludeSearch.split(':');

    return {
        id: removeQuotes(splitArray[0]), //'ID':true
        shouldChange: isTruthy(removeQuotes(splitArray[1])),
    };
}

export function isStartside(startSide: string): boolean {
    return startSide != '-' && startSide != '';
}
