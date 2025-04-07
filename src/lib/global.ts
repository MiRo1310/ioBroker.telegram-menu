import type { DecomposeText } from './telegram-menu';
import { error } from './logging';

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const deleteDoubleEntriesInArray = (arr: string[]): string[] =>
    arr.filter((item, index) => arr.indexOf(item) === index);

export const replaceAll = (text: string, searchValue: string, replaceValue: string): string =>
    text.replace(new RegExp(searchValue, 'g'), replaceValue);

export function isJSON(_string: string): boolean {
    try {
        JSON.parse(_string);
        return true;
    } catch (error) {
        console.error([{ text: 'Error:', val: error }]);
        return false;
    }
}

export function decomposeText(text: string, searchValue: string, secondValue: string): DecomposeText {
    const startindex = text.indexOf(searchValue);
    const endindex = text.indexOf(secondValue, startindex);
    const substring = text.substring(startindex, endindex + secondValue.length);
    const textWithoutSubstring = text.replace(substring, '').trim();
    return {
        startindex: startindex,
        endindex: endindex,
        substring: substring,
        textWithoutSubstring: textWithoutSubstring,
    };
}

export const deepCopy = <T>(obj: T): T | undefined => {
    try {
        if (!obj) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    } catch (err) {
        console.error(`Error deepCopy: ${JSON.stringify(err)}`);
    }
};

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isTruthy = (value: string | number | boolean): boolean => ['1', 1, true, 'true'].includes(value);

export const isFalsy = (value: string | number | boolean | undefined | null): boolean =>
    ['0', 0, false, 'false', undefined, null].includes(value);

export function checkDirectoryIsOk(directory: string): boolean {
    if (['', null, undefined].includes(directory)) {
        error([
            {
                text: 'Error:',
                val: 'No directory to save the picture. Please add a directory in the settings with full read and write permissions.',
            },
        ]);
        return false;
    }
    return true;
}
