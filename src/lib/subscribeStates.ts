import TelegramMenu from '../main';
import { deleteDoubleEntriesInArray } from './global';
import { debug } from './logging';
import type { SetStateIds } from '../types/types';

async function _subscribeAndUnSubscribeForeignStatesAsync(obj: { array?: SetStateIds[]; id?: string }): Promise<void> {
    const _this = TelegramMenu.getInstance();
    if (obj.id) {
        debug([
            { text: 'ID to subscribe:', val: obj.id },
            { text: 'Subscribe:', val: await _this.subscribeForeignStatesAsync(obj.id) },
        ]);
    } else if (obj.array) {
        for (const element of obj.array) {
            await _this.subscribeForeignStatesAsync(element.id);
        }
    }
}

async function _subscribeForeignStatesAsync(array: string[]): Promise<void> {
    const _this = TelegramMenu.getInstance();
    array = deleteDoubleEntriesInArray(array);
    for (const element of array) {
        await _this.subscribeForeignStatesAsync(element);
    }
    debug([{ text: 'Subscribe all States of:', val: array }]);
}

export { _subscribeAndUnSubscribeForeignStatesAsync, _subscribeForeignStatesAsync };
