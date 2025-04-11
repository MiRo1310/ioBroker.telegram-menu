"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports._subscribeAndUnSubscribeForeignStatesAsync = _subscribeAndUnSubscribeForeignStatesAsync;
exports._subscribeForeignStatesAsync = _subscribeForeignStatesAsync;
const main_1 = require("../main");
const global_1 = require("./global");
const string_1 = require("../lib/string");
async function _subscribeAndUnSubscribeForeignStatesAsync(obj) {
    if (obj.id) {
        main_1._this.log.debug(`Subscribe to ${obj.id}`);
    }
    else if (obj.array) {
        for (const element of obj.array) {
            await main_1._this.subscribeForeignStatesAsync(element.id);
        }
    }
}
async function _subscribeForeignStatesAsync(array) {
    array = (0, global_1.deleteDoubleEntriesInArray)(array);
    for (const element of array) {
        await main_1._this.subscribeForeignStatesAsync(element);
    }
    main_1._this.log.debug(`Subscribe all States of: ${(0, string_1.jsonString)(array)}`);
}
