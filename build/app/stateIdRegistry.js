"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateIdRegistry = void 0;
const subscribeStates_1 = require("../app/subscribeStates");
class StateIdRegistry {
    appContext;
    stateIdRegistry = [];
    constructor(appContext) {
        this.appContext = appContext;
    }
    getIds() {
        return this.stateIdRegistry;
    }
    async addIds(adapter, setStateId) {
        if (this.findId(setStateId)) {
            adapter.log.debug(`StateIdRegistry: ID "${setStateId.id}" is already registered, skipping duplicate registration.`);
            return;
        }
        this.stateIdRegistry.push(setStateId);
        await (0, subscribeStates_1._subscribeForeignStates)(this.appContext, StateIdRegistry.setStateIdsToIdArray([setStateId]));
    }
    findId(setStateId) {
        return this.stateIdRegistry.find(list => list.id === setStateId.id);
    }
    static setStateIdsToIdArray(setStateIds) {
        return setStateIds.map(obj => obj.id);
    }
}
exports.StateIdRegistry = StateIdRegistry;
//# sourceMappingURL=stateIdRegistry.js.map