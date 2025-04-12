import { config } from '../config/config';
import type { ExchangeValueReturn, PrimitiveType } from '../types/types';
import { adapter } from '../app/adapterManager';

export const jsonString = (val?: string | number | boolean | object | null): string => JSON.stringify(val);

export function parseJSON<T>(val: string): {
    json: T | string;
    isValidJson: boolean;
} {
    try {
        const parsed = JSON.parse(val);
        return { json: parsed as T, isValidJson: true };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        return { json: val, isValidJson: false };
    }
}

export const replaceAll = (text: string, searchValue: string, replaceValue: string): string => {
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape-Sonderzeichen
    return text.replace(new RegExp(escapedSearchValue, 'g'), replaceValue).trim();
};

export const validateNewLine = (text?: string): string => {
    if (!text) {
        return '';
    }
    return text
        .replace(/^['"]|['"]$/g, '') // Entferne Anführungszeichen am Anfang/Ende
        .replace(/\\n/g, '\n') // Ersetze \n durch einen echten Zeilenumbruch
        .replace(/ \\\n/g, '\n') // Ersetze \n mit Leerzeichen davor durch einen echten Zeilenumbruch
        .replace(/\\(?!n)/g, ''); // Entferne alle Backslashes, die nicht von einem 'n' gefolgt werden
};

export function decomposeText(
    text: string,
    searchValue: string,
    secondValue: string,
): { startindex: number; endindex: number; substring: string; textWithoutSubstring: string } {
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

export const getValueToExchange = (textToSend: string, val: PrimitiveType): ExchangeValueReturn => {
    if (textToSend.includes(config.replacer.change.start)) {
        const { start, end, command } = config.replacer.change;
        const { startindex, endindex, substring } = decomposeText(textToSend, start, end); // change{"true":"an","false":"aus"}

        const modifiedString = replaceAll(substring, "'", '"').replace(command, ''); // {"true":"an","false":"aus"}

        const { json, isValidJson } = parseJSON<Record<string, string>>(modifiedString);

        if (isValidJson) {
            const _json = json as Record<string, string>;
            return {
                newValue: _json[String(val)] ?? val,
                textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1),
                error: false,
            };
        }
        adapter.log.error(`There is a error in your input: ${modifiedString}`);
        return { newValue: val, textToSend, error: true };
    }
    return { textToSend, newValue: val, error: false };
};
