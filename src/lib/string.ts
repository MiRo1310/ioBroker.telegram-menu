import type { BooleanString } from '@/types/app';
import { errorLogger } from '@b/app/logging';
import type { Adapter, DecomposeTextReturnType, StringReplacerObj } from '@b/types/types';
import { isTruthy } from '@b/lib/utils';

export const jsonString = (val?: string | number | boolean | object | null): string => JSON.stringify(val);

export function parseJSON<T>(
    val: string | null,
    adapter?: Adapter,
): { json: string; isValidJson: false } | { json: T; isValidJson: true } {
    try {
        return val ? { json: JSON.parse(val) as T, isValidJson: true } : { json: val ?? '', isValidJson: false };
    } catch (e) {
        if (adapter) {
            errorLogger('Error parseJSON:', e, adapter);
        }
        return { json: val ?? '', isValidJson: false };
    }
}

export const replaceAll = (text: string, searchValue: string, replaceValue: string): string => {
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escapedSearchValue, 'g'), replaceValue);
};

export const replaceAllItems = (text: string, searched: (string | { search: string; val: string })[]): string => {
    searched.forEach(item => {
        if (typeof item === 'string') {
            text = replaceAll(text, item, '');
        } else {
            text = replaceAll(text, item.search, item.val);
        }
    });
    return text;
};

/**
 * @deprecated
 * use mrRemoveQuotes instead if updated
 * @param text
 */
export const removeQuotes = (text: string): string => text.replace(/['"]/g, '');

/**
 * @deprecated
 * use mrSingleQuotesToDoubleQuotes instead if updated
 * @param text
 */
export const singleQuotesToDoubleQuotes = (text: string): string => text.replace(/'/g, '"');

/**
 * @deprecated
 * use mrRemoveDuplicatedSpaces instead if updated
 * @param text Text
 */
export const removeDuplicateSpaces = (text: string): string => text.replace(/\s+/g, ' ').trim();

export const cleanUpString = (text?: string): string => {
    if (!text) {
        return '';
    }
    return text
        .replace(/^['"]|['"]$/g, '') // Entferne Anführungszeichen am Anfang/Ende
        .replace(/\\n/g, '\n') // Ersetze \n durch einen echten Zeilenumbruch
        .replace(/ \\\n/g, '\n') // Ersetze \n mit Leerzeichen davor durch einen echten Zeilenumbruch
        .replace(/\\(?!n)/g, '') // Entferne alle Backslashes, die nicht von einem 'n' gefolgt werden)
        .replace(/\n /g, '\n') // Entferne Leerzeichen vor Zeilenumbrüchen
        .replace(/ {2,}/g, ' ');
};

/**
 * Decomposes the text into parts based on two search strings.
 *
 * @deprecated
 * use mrDecomposeText instead if updated
 * @param text
 * @param firstSearch
 * @param secondSearch
 */
export function decomposeText(text: string, firstSearch: string, secondSearch: string): DecomposeTextReturnType {
    const startindex = text.indexOf(firstSearch);
    const endindex = text.indexOf(secondSearch, startindex);
    const substring = text.substring(startindex, endindex + secondSearch.length);
    const substringExcludedSearch = stringReplacer(substring, [firstSearch, secondSearch]);
    const textWithoutSubstring = text.replace(substring, '').trim();
    return {
        startindex,
        endindex,
        substring,
        textExcludeSubstring: textWithoutSubstring,
        substringExcludeSearch: substringExcludedSearch,
    };
}

/**
 * @deprecated
 * use mrIsString instead if updated
 * @param value
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

export function stringReplacer(substring: string, valueToReplace: string[] | StringReplacerObj[]): string {
    if (typeof valueToReplace[0] === 'string') {
        (valueToReplace as string[]).forEach(item => {
            substring = substring.replace(item, '');
        });
        return substring;
    }

    (valueToReplace as StringReplacerObj[]).forEach(({ val, newValue }) => {
        substring = substring.replace(val, newValue);
    });
    return substring;
}

/**
 * @deprecated
 * use mrPad instead if updated
 * @param value
 * @param length
 */
export const pad = (value: number, length: number = 2): string => {
    if (value < 0) {
        return `-${(value * -1).toString().padStart(length - 1, '0')}`;
    }
    return value.toString().padStart(length, '0');
};

export function ifTruthyAddNewLine(newline: BooleanString): '' | '\n' {
    return isTruthy(newline) ? '\n' : '';
}

export function isBooleanString(str: string): boolean {
    return str === 'true' || str === 'false';
}

export const isNonEmptyString = (str: string): boolean => str.trim() !== '';
export const isEmptyString = (str: string): boolean => str.trim() === '';
