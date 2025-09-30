"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._subscribeForeignStates = void 0;
const main_1 = require("../main");
const object_1 = require("../lib/object");
async function _subscribeForeignStates(val) {
    if (typeof val === 'string') {
        main_1.adapter.log.debug(`Subscribe to ${val}`);
        await main_1.adapter.subscribeForeignStatesAsync(val);
        return;
    }
    const array = (0, object_1.removeDuplicates)(val);
    for (const id of array) {
        await main_1.adapter.subscribeForeignStatesAsync(id);
    }
}
exports._subscribeForeignStates = _subscribeForeignStates;
//# sourceMappingURL=subscribeStates.js.map