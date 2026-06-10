"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._subscribeForeignStates = _subscribeForeignStates;
const object_1 = require("../lib/object");
async function _subscribeForeignStates(appContext, val) {
    if (typeof val === 'string') {
        appContext.adapter.log.debug(`Subscribe to ${val}`);
        await appContext.adapter.subscribeForeignStatesAsync(val);
        return;
    }
    const array = (0, object_1.removeDuplicates)(val);
    for (const id of array) {
        await appContext.adapter.subscribeForeignStatesAsync(id);
    }
}
//# sourceMappingURL=subscribeStates.js.map