"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateIdsToListenTo = getStateIdsToListenTo;
exports.addSetStateIds = addSetStateIds;
const subscribeStates_1 = require("../app/subscribeStates");
const object_1 = require("../lib/object");
const setStateIdsToListenTo = [];
function getStateIdsToListenTo() {
    return setStateIdsToListenTo;
}
function getFind(setStateId) {
    return setStateIdsToListenTo.find(list => list.id === setStateId.id);
}
async function addSetStateIds(adapter, setStateId) {
    if (getFind(setStateId)) {
        return;
    }
    setStateIdsToListenTo.push(setStateId);
    await (0, subscribeStates_1._subscribeForeignStates)(adapter, (0, object_1.setStateIdsToIdArray)([setStateId]));
}
//# sourceMappingURL=setStateIdsToListenTo.js.map