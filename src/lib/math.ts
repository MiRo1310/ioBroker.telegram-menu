import type { Adapter, EvaluateReturnType } from '../types/types';
import { errorLogger } from '../app/logging';
import { decomposeText } from './string';
import { config } from '../config/config';
import { adapter } from '../main';

export function evaluate(val: string[], adapter: Adapter): EvaluateReturnType {
    try {
        return { val: eval(val.join(' ')) ?? '', error: false };
    } catch (e: any) {
        errorLogger('Error Eval:', e, adapter);
        return { val: '', error: true };
    }
}

export function calcValue(textToSend: string, val: string): { textToSend: string; val: string; error: boolean } {
    const { substringExcludedSearch, textWithoutSubstring } = decomposeText(
        textToSend,
        config.math.start,
        config.math.end,
    );
    const { val: evalVal, error } = evaluate([val, substringExcludedSearch], adapter);

    return error
        ? { textToSend: textWithoutSubstring, val, error }
        : { textToSend: textWithoutSubstring, val: evalVal, error };
}
