"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._subscribeAndUnSubscribeForeignStatesAsync = _subscribeAndUnSubscribeForeignStatesAsync;
exports._subscribeForeignStatesAsync = _subscribeForeignStatesAsync;
const main_1 = require("../main");
const string_1 = require("../lib/string");
const object_1 = require("../lib/object");
async function _subscribeAndUnSubscribeForeignStatesAsync(obj) {
    if (obj.id) {
        main_1.adapter.log.debug(`Subscribe to ${obj.id}`);
    }
    else if (obj.array) {
        for (const element of obj.array) {
            await main_1.adapter.subscribeForeignStatesAsync(element.id);
        }
    }
}
async function _subscribeForeignStatesAsync(array) {
    array = (0, object_1.removeDuplicates)(array);
    for (const element of array) {
        await main_1.adapter.subscribeForeignStatesAsync(element);
    }
    main_1.adapter.log.debug(`Subscribe all States of: ${(0, string_1.jsonString)(array)}`);
}
//# sourceMappingURL=subscribeStates.js.map