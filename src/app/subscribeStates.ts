import { adapter } from '../main';
import type { SetStateIds } from '../types/types';
import { jsonString } from '../lib/string';
import { removeDuplicates } from '../lib/object';

async function _subscribeAndUnSubscribeForeignStatesAsync(obj: { array?: SetStateIds[]; id?: string }): Promise<void> {
    if (obj.id) {
        adapter.log.debug(`Subscribe to ${obj.id}`);
    } else if (obj.array) {
        for (const element of obj.array) {
            await adapter.subscribeForeignStatesAsync(element.id);
        }
    }
}

async function _subscribeForeignStatesAsync(array: string[]): Promise<void> {
    array = removeDuplicates(array);
    for (const element of array) {
        await adapter.subscribeForeignStatesAsync(element);
    }
    adapter.log.debug(`Subscribe all States of: ${jsonString(array)}`);
}

export { _subscribeAndUnSubscribeForeignStatesAsync, _subscribeForeignStatesAsync };
