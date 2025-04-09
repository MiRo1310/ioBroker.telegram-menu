import type { DecomposeText } from '../types/types';
import { errorLogger } from './logging';
import { _this } from '../main';

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const deleteDoubleEntriesInArray = (arr: string[]): string[] =>
    arr.filter((item, index) => arr.indexOf(item) === index);

export const replaceAll = (text: string, searchValue: string, replaceValue: string): string =>
    text.replace(new RegExp(searchValue, 'g'), replaceValue);

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
        _this.log.error(
            'No directory to save the picture. Please add a directory in the settings with full read and write permissions.',
        );
        return false;
    }
    return true;
}

export function parseJSON<T>(value: string): T | undefined {
    try {
        return JSON.parse(value);
    } catch (error) {
        errorLogger('Error parseJson: ', error);
        return undefined;
    }
}
