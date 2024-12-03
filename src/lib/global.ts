import type { DecomposeText } from './telegram-menu';

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
