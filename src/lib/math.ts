import type { Adapter, EvaluateReturnType } from '../types/types';
import { errorLogger } from '../app/logging';

export function evaluate(val: string[], adapter: Adapter): EvaluateReturnType {
    try {
        return { val: eval(val.join(' ')) ?? '', error: false };
    } catch (e: any) {
        errorLogger('Error Eval:', e, adapter);
        return { val: '', error: true };
    }
}
