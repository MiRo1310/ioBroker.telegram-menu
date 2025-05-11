"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateIdsToListenTo = getStateIdsToListenTo;
exports.addSetStateIds = addSetStateIds;
const subscribeStates_1 = require("./subscribeStates");
const object_1 = require("../lib/object");
const setStateIdsToListenTo = [];
function getStateIdsToListenTo() {
    return setStateIdsToListenTo;
}
async function addSetStateIds(setStateId) {
    if (!setStateIdsToListenTo.find(list => list.id === setStateId.id)) {
        setStateIdsToListenTo.push(setStateId);
        await (0, subscribeStates_1._subscribeForeignStates)((0, object_1.setStateIdsToIdArray)([setStateId]));
    }
}
//# sourceMappingURL=setStateIdsToListenTo.js.map