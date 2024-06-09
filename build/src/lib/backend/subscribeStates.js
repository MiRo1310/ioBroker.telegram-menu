"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._subscribeForeignStatesAsync = exports._subscribeAndUnSubscribeForeignStatesAsync = void 0;
const main_1 = __importDefault(require("../../main"));
const global_1 = require("./global");
const logging_1 = require("./logging");
async function _subscribeAndUnSubscribeForeignStatesAsync(obj) {
    const _this = main_1.default.getInstance();
    if (obj.id) {
        (0, logging_1.debug)([
            { text: "ID to subscribe:", val: obj.id },
            { text: "Subscribe:", val: await _this.subscribeForeignStatesAsync(obj.id) },
        ]);
    }
    else if (obj.array) {
        obj.array.forEach((element) => {
            _this.unsubscribeForeignStatesAsync(element["id"]);
        });
    }
}
exports._subscribeAndUnSubscribeForeignStatesAsync = _subscribeAndUnSubscribeForeignStatesAsync;
function _subscribeForeignStatesAsync(array) {
    const _this = main_1.default.getInstance();
    array = (0, global_1.deleteDoubleEntriesInArray)(array);
    array.forEach((element) => {
        _this.subscribeForeignStatesAsync(element);
    });
    (0, logging_1.debug)([{ text: "Subscribe all States of:", val: array }]);
}
exports._subscribeForeignStatesAsync = _subscribeForeignStatesAsync;
//# sourceMappingURL=subscribeStates.js.map