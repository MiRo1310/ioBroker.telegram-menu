import type { Adapter, SetStateIds } from '@b/types/types';
import { _subscribeForeignStates } from '@b/app/subscribeStates';
import { setStateIdsToIdArray } from '@b/lib/object';

const setStateIdsToListenTo: SetStateIds[] = [];

export function getStateIdsToListenTo(): SetStateIds[] {
    return setStateIdsToListenTo;
}

export async function addSetStateIds(adapter: Adapter, setStateId: SetStateIds): Promise<void> {
    if (!setStateIdsToListenTo.find(list => list.id === setStateId.id)) {
        setStateIdsToListenTo.push(setStateId);

        await _subscribeForeignStates(adapter, setStateIdsToIdArray([setStateId]));
    }
}
