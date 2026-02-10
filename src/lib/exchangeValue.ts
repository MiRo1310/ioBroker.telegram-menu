import { decomposeText, parseJSON, removeDuplicateSpaces, replaceAll } from '@b/lib/string';
import type { Adapter, ExchangeValueReturn, PrimitiveType } from '@b/types/types';
import { config } from '@b/config/config';

export function isNoValueParameter(textToSend: string): { insertValue: boolean; textToSend: string } {
    let insertValue = true;
    if (textToSend.includes('{novalue}')) {
        textToSend = removeDuplicateSpaces(textToSend.replace('{novalue}', ''));
        insertValue = false;
    }
    return { insertValue, textToSend };
}

export const exchangeValue = (
    adapter: Adapter,
    textToSend: string,
    val: PrimitiveType | null | undefined,
    shouldChange = true,
): ExchangeValueReturn => {
    const result = isNoValueParameter(textToSend);

    textToSend = result.textToSend;
    if (textToSend.includes(config.change.start) && shouldChange) {
        const { start, end, command } = config.change;
        const { substring, textExcludeSubstring } = decomposeText(textToSend, start, end); // change{"true":"an","false":"aus"}

        const stringExcludedChange = replaceAll(substring, "'", '"').replace(command, ''); // {"true":"an","false":"aus"}

        const { json, isValidJson } = parseJSON<Record<string, string>>(stringExcludedChange);
        if (isValidJson) {
            const newValue = json[String(val)] ?? val;

            return {
                newValue,
                textToSend: removeDuplicateSpaces(
                    exchangePlaceholderWithValue(textExcludeSubstring, result.insertValue ? newValue : ''),
                ),
                error: false,
            };
        }
        adapter.log.error(`There is a error in your input: ${stringExcludedChange}`);
        return { newValue: val ?? '', textToSend: removeDuplicateSpaces(textToSend), error: true };
    }
    const text = removeDuplicateSpaces(exchangePlaceholderWithValue(textToSend, result.insertValue ? (val ?? '') : ''));

    return {
        textToSend: text,
        newValue: val ?? '',
        error: false,
    };
};

export function exchangePlaceholderWithValue(textToSend: string, val: PrimitiveType): string {
    const searchString = getPlaceholderValue(textToSend);
    return searchString !== ''
        ? textToSend.replace(searchString, val.toString()).trim()
        : `${textToSend} ${val}`.trim();
}

export function getPlaceholderValue(textToSend: string): string {
    if (textToSend.includes('&&')) {
        return '&&';
    }
    if (textToSend.includes('&amp;&amp;')) {
        return '&amp;&amp;';
    }
    return '';
}
