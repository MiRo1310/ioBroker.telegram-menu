"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateIdRegistry = void 0;
const subscribeStates_1 = require("../app/subscribeStates");
const object_1 = require("../lib/object");
class StateIdRegistry {
    stateIdRegistry = [];
    getIds() {
        return this.stateIdRegistry;
    }
    async addIds(adapter, setStateId) {
        if (this.findId(setStateId)) {
            return;
        }
        this.stateIdRegistry.push(setStateId);
        await (0, subscribeStates_1._subscribeForeignStates)(adapter, (0, object_1.setStateIdsToIdArray)([setStateId]));
    }
    findId(setStateId) {
        return this.stateIdRegistry.find(list => list.id === setStateId.id);
    }
}
exports.stateIdRegistry = new StateIdRegistry();
//# sourceMappingURL=stateIdRegistry.js.map