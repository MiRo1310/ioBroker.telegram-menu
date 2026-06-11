"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateIdRegistry = void 0;
const subscribeStates_1 = require("../app/subscribeStates");
const object_1 = require("../lib/object");
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
            adapter.log.warn(`StateIdRegistry: ID "${setStateId.id}" is already registered, skipping duplicate registration.`);
            return;
        }
        this.stateIdRegistry.push(setStateId);
        await (0, subscribeStates_1._subscribeForeignStates)(this.appContext, (0, object_1.setStateIdsToIdArray)([setStateId]));
    }
    findId(setStateId) {
        return this.stateIdRegistry.find(list => list.id === setStateId.id);
    }
}
exports.StateIdRegistry = StateIdRegistry;
//# sourceMappingURL=stateIdRegistry.js.map