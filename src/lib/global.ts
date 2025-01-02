import type { DecomposeText } from './telegram-menu';
import { error } from './logging';

function deleteDoubleEntriesInArray(arr: string[]): string[] {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

function replaceAll(text: string, searchValue: string, replaceValue: string): string {
    return text.replace(new RegExp(searchValue, 'g'), replaceValue);
}

function isJSON(_string: string): boolean {
    try {
        JSON.parse(_string);
        return true;
    } catch (error) {
        console.error([{ text: 'Error:', val: error }]);
        return false;
    }
}

function decomposeText(text: string, searchValue: string, secondValue: string): DecomposeText {
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
        return JSON.parse(JSON.stringify(obj));
    } catch (err) {
        console.error(`Error deepCopy: ${JSON.stringify(err)}`);
    }
};

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export { deleteDoubleEntriesInArray, replaceAll, isJSON, decomposeText };

export function isTruthy(value: string | number | boolean): boolean {
    return value === '1' || value === 1 || value === true || value === 'true';
}

export function isFalsy(value: string | number | boolean | undefined | null): boolean {
    return ['0', 0, false, 'false', undefined, null].includes(value);
}

export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

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
