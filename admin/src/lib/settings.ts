import { isDefined } from '@backend/lib/utils';

export function shouldDefaultSendMenuAfterRestart(value: boolean | undefined | null): boolean {
    return !isDefined(value);
}
