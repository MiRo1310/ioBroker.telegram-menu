import { config } from '../config/config';
import type {
    Adapter,
    DecomposeTextReturnType,
    ExchangeValueReturn,
    PrimitiveType,
    StringReplacerObj,
} from '../types/types';

export const jsonString = (val?: string | number | boolean | object | null): string => JSON.stringify(val);

export function parseJSON<T>(val: string): { json: string; isValidJson: false } | { json: T; isValidJson: true } {
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
        textWithoutSubstring,
        substringExcludedSearch,
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
