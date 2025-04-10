import { _this } from '../main';
import { deleteDoubleEntriesInArray } from './global';
import type { SetStateIds } from '../types/types';
import { jsonString } from '../lib/string';

async function _subscribeAndUnSubscribeForeignStatesAsync(obj: { array?: SetStateIds[]; id?: string }): Promise<void> {
    if (obj.id) {
        _this.log.debug(`Subscribe to ${obj.id}`);
    } else if (obj.array) {
        for (const element of obj.array) {
            await _this.subscribeForeignStatesAsync(element.id);
        }
    }
}

async function _subscribeForeignStatesAsync(array: string[]): Promise<void> {
    array = deleteDoubleEntriesInArray(array);
    for (const element of array) {
        await _this.subscribeForeignStatesAsync(element);
    }
    _this.log.debug(`Subscribe all States of: ${jsonString(array)}`);
}

export { _subscribeAndUnSubscribeForeignStatesAsync, _subscribeForeignStatesAsync };
