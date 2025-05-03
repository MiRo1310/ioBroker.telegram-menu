import type { Adapter, EvaluateReturnType } from '../types/types';
import { errorLogger } from '../app/logging';

export function evaluate(val: string | string[], adapter: Adapter): EvaluateReturnType {
    try {
        if (Array.isArray(val)) {
            return { val: eval(val.join(' ')) ?? '', error: false };
        }
        return { val: eval(val), error: false };
    } catch (e: any) {
        errorLogger('Error Eval:', e, adapter);
        return { val: '', error: true };
    }
}
