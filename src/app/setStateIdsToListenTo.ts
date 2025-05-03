import type { SetStateIds } from '../types/types';
import { _subscribeForeignStates } from './subscribeStates';
import { setStateIdsToIdArray } from '../lib/object';

const setStateIdsToListenTo: SetStateIds[] = [];

export function getStateIdsToListenTo(): SetStateIds[] {
    return setStateIdsToListenTo;
}

export async function addSetStateIds(setStateId: SetStateIds): Promise<void> {
    if (!setStateIdsToListenTo.find(list => list.id === setStateId.id)) {
        setStateIdsToListenTo.push(setStateId);

        await _subscribeForeignStates(setStateIdsToIdArray([setStateId]));
    }
}
