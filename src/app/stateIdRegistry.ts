import type { Adapter, SetStateIds } from '@backend/types/types';
import { _subscribeForeignStates } from '@backend/app/subscribeStates';
import type { AppContext } from '@backend/app/appContext';

export class StateIdRegistry {
    private stateIdRegistry: SetStateIds[] = [];

    constructor(private readonly appContext: AppContext) {}

    public getIds(): SetStateIds[] {
        return this.stateIdRegistry;
    }

    public async addIds(adapter: Adapter, setStateId: SetStateIds): Promise<void> {
        if (this.findId(setStateId)) {
            adapter.log.debug(
                `StateIdRegistry: ID "${setStateId.id}" is already registered, skipping duplicate registration.`,
            );
            return;
        }
        this.stateIdRegistry.push(setStateId);

        await _subscribeForeignStates(this.appContext, StateIdRegistry.setStateIdsToIdArray([setStateId]));
    }

    private findId(setStateId: SetStateIds): SetStateIds | undefined {
        return this.stateIdRegistry.find(list => list.id === setStateId.id);
    }

    public static setStateIdsToIdArray(setStateIds: SetStateIds[]): string[] {
        return setStateIds.map(obj => obj.id);
    }
}
