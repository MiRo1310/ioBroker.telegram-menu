import type { Adapter, SetStateIds } from '@backend/types/types';
import { _subscribeForeignStates } from '@backend/app/subscribeStates';
import { setStateIdsToIdArray } from '@backend/lib/object';

class StateIdRegistry {
    private stateIdRegistry: SetStateIds[] = [];

    public getIds(): SetStateIds[] {
        return this.stateIdRegistry;
    }

    public async addIds(adapter: Adapter, setStateId: SetStateIds): Promise<void> {
        if (this.findId(setStateId)) {
            return;
        }
        this.stateIdRegistry.push(setStateId);

        await _subscribeForeignStates(adapter, setStateIdsToIdArray([setStateId]));
    }

    private findId(setStateId: SetStateIds): SetStateIds | undefined {
        return this.stateIdRegistry.find(list => list.id === setStateId.id);
    }
}

export const stateIdRegistry = new StateIdRegistry();
