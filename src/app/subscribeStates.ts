import { removeDuplicates } from '../lib/object';
import type { Adapter } from '@b/types/types';

export async function _subscribeForeignStates(adapter: Adapter, val: string | string[]): Promise<void> {
    if (typeof val === 'string') {
        adapter.log.debug(`Subscribe to ${val}`);
        await adapter.subscribeForeignStatesAsync(val);
        return;
    }

    const array = removeDuplicates(val);
    for (const id of array) {
        await adapter.subscribeForeignStatesAsync(id);
    }
}
