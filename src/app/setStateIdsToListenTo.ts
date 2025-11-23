import type { Adapter, SetStateIds } from '@b/types/types';
import { _subscribeForeignStates } from '@b/app/subscribeStates';
import { setStateIdsToIdArray } from '@b/lib/object';

const setStateIdsToListenTo: SetStateIds[] = [];

export function getStateIdsToListenTo(): SetStateIds[] {
    return setStateIdsToListenTo;
}

function getFind(setStateId: SetStateIds): SetStateIds | undefined {
    return setStateIdsToListenTo.find(list => list.id === setStateId.id);
}

export async function addSetStateIds(adapter: Adapter, setStateId: SetStateIds): Promise<void> {
    if (getFind(setStateId)) {
        return;
    }
    setStateIdsToListenTo.push(setStateId);

    await _subscribeForeignStates(adapter, setStateIdsToIdArray([setStateId]));
}
