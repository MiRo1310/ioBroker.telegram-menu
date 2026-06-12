import { removeDuplicates } from '../lib/object';
import type { AppContext } from '@backend/app/appContext';

export async function _subscribeForeignStates(appContext: AppContext, val: string | string[]): Promise<void> {
    if (typeof val === 'string') {
        appContext.adapter.log.debug(`Subscribe to ${val}`);
        await appContext.adapter.subscribeForeignStatesAsync(val);
        return;
    }

    const array = removeDuplicates(val);
    for (const id of array) {
        await appContext.adapter.subscribeForeignStatesAsync(id);
    }
}
