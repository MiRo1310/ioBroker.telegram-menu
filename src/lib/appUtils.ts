import { config } from '../config/config';
import type { Adapter, MenusWithUsers } from '../types/types';
import { decomposeText } from './string';
import { errorLogger } from '../app/logging';
import { evaluate } from './math';

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

export function roundValue(
    val: string,
    textToSend: string,
    adapter: Adapter,
): { val: string; textToSend: string; error: boolean } {
    try {
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
    } catch (err: any) {
        errorLogger('Error roundValue:', err, adapter);
        return { val, textToSend, error: true };
    }
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
