"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSetStateIds = exports.getStateIdsToListenTo = void 0;
const subscribeStates_1 = require("./subscribeStates");
const object_1 = require("../lib/object");
const setStateIdsToListenTo = [];
function getStateIdsToListenTo() {
    return setStateIdsToListenTo;
}
exports.getStateIdsToListenTo = getStateIdsToListenTo;
async function addSetStateIds(setStateId) {
    if (!setStateIdsToListenTo.find(list => list.id === setStateId.id)) {
        setStateIdsToListenTo.push(setStateId);
        await (0, subscribeStates_1._subscribeForeignStates)((0, object_1.setStateIdsToIdArray)([setStateId]));
    }
}
exports.addSetStateIds = addSetStateIds;
//# sourceMappingURL=setStateIdsToListenTo.js.map