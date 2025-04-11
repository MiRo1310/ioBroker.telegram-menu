import { _this } from '../main';

export const jsonString = (val?: string | number | boolean | object | null): string => JSON.stringify(val);

export function parseJSON<T>(val: string): { json: T; isValidJson: boolean } {
    try {
        const parsed = JSON.parse(val);
        return { json: parsed, isValidJson: true };
    } catch (error: any) {
        _this.log.error(`Error parse json: ${jsonString(error)}`);
        return { json: {} as T, isValidJson: false };
    }
}

export const validateNewLine = (text: string): string => {
    const { json, isValidJson } = parseJSON<string>(text);
    if (isValidJson) {
        text = json;
    }

    return text.replace(/""/g, '"').replace(/\\n/g, '\n');
};

export const replaceAll = (text: string, searchValue: string, replaceValue: string): string =>
    text.replace(new RegExp(searchValue, 'g'), replaceValue);
