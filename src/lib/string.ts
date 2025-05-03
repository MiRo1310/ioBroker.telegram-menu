import { config } from '../config/config';
import type {
    Adapter,
    BooleanString,
    DecomposeTextReturnType,
    ExchangeValueReturn,
    PrimitiveType,
    StringReplacerObj,
} from '../types/types';
import { isTruthy } from './utils';
import { errorLogger } from '../app/logging';

export const jsonString = (val?: string | number | boolean | object | null): string => JSON.stringify(val);

export function parseJSON<T>(
    val: string,
    adapter?: Adapter,
): { json: string; isValidJson: false } | { json: T; isValidJson: true } {
    try {
        return { json: JSON.parse(val) as T, isValidJson: true };
    } catch (e) {
        if (adapter) {
            errorLogger('Error parseJSON:', e, adapter);
        }
        return { json: val, isValidJson: false };
    }
}

export const replaceAll = (text: string, searchValue: string, replaceValue: string): string => {
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape-Sonderzeichen
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

export const removeQuotes = (text: string): string => text.replace(/['"]/g, '');

export const cleanUpString = (text?: string): string => {
    if (!text) {
        return '';
    }
    return text
        .replace(/^['"]|['"]$/g, '') // Entferne Anführungszeichen am Anfang/Ende
        .replace(/\\n/g, '\n') // Ersetze \n durch einen echten Zeilenumbruch
        .replace(/ \\\n/g, '\n') // Ersetze \n mit Leerzeichen davor durch einen echten Zeilenumbruch
        .replace(/\\(?!n)/g, ''); // Entferne alle Backslashes, die nicht von einem 'n' gefolgt werden
};

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

export const getValueToExchange = (adapter: Adapter, textToSend: string, val: PrimitiveType): ExchangeValueReturn => {
    if (textToSend.includes(config.change.start)) {
        const { start, end, command } = config.change;
        const { startindex, endindex, substring } = decomposeText(textToSend, start, end); // change{"true":"an","false":"aus"}

        const modifiedString = replaceAll(substring, "'", '"').replace(command, ''); // {"true":"an","false":"aus"}

        const { json, isValidJson } = parseJSON<Record<string, string>>(modifiedString);

        if (isValidJson) {
            return {
                newValue: json[String(val)] ?? val,
                textToSend: textToSend.substring(0, startindex) + textToSend.substring(endindex + 1),
                error: false,
            };
        }
        adapter.log.error(`There is a error in your input: ${modifiedString}`);
        return { newValue: val, textToSend, error: true };
    }
    return { textToSend, newValue: val, error: false };
};

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

export const pad = (value: number, length: number = 2): string => {
    if (value < 0) {
        return `-${(value * -1).toString().padStart(length - 1, '0')}`;
    }
    return value.toString().padStart(length, '0');
};

export function getNewline(newline: BooleanString): '' | '\n' {
    return isTruthy(newline) ? '\n' : '';
}

export function isBooleanString(str: string): boolean {
    return str === 'true' || str === 'false';
}

export const isNonEmptyString = (str: string): boolean => str.trim() !== '';
export const isEmptyString = (str: string): boolean => str.trim() === '';
